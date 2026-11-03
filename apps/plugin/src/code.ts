figma.showUI(__html__, {
  width: 440,
  height: 650,
  themeColors: true
});

async function scanVariables() {
  try {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();

    const variables =
      await figma.variables.getLocalVariablesAsync();

    const collectionMap = new Map(
      collections.map(collection => [
        collection.id,
        collection
      ])
    );

    const tokens = variables.map(variable => {
      const collection = collectionMap.get(
        variable.variableCollectionId
      );

      const modes = (collection?.modes ?? []).map(mode => {
        const value = variable.valuesByMode[mode.modeId];

        const isAlias =
          typeof value === "object" &&
          value !== null &&
          "type" in value &&
          value.type === "VARIABLE_ALIAS";

        return {
          modeId: mode.modeId,
          modeName: mode.name,
          value: isAlias ? null : value,
          aliasTo: isAlias ? value.id : undefined
        };
      });

      return {
        id: variable.id,
        name: variable.name,
        type: variable.resolvedType,
        description: variable.description,
        collectionId: variable.variableCollectionId,
        collectionName: collection?.name ?? "Unknown",
        modes
      };
    });

    figma.ui.postMessage({
      type: "SCAN_RESULT",
      payload: {
        fileName: figma.root.name,
        collections: collections.map(collection => ({
          id: collection.id,
          name: collection.name,
          modes: collection.modes
        })),
        tokens
      }
    });
  } catch (error) {
    figma.ui.postMessage({
      type: "ERROR",
      message: error instanceof Error
        ? error.message
        : "Variable scan failed"
    });
  }
}

figma.ui.onmessage = async (message) => {
  if (message.type === "SCAN") {
    await scanVariables();
  }

  if (message.type === "CLOSE") {
    figma.closePlugin();
  }
};
