const { user } = require("../../models");

/**
 * Middleware to format response with creator/updater names
 * @param {Object} Model - Sequelize model to use for fetching user data
 * @returns {Function} Express middleware function
 */
const withCreatorUpdaterNames = (Model) => {
  return async (req, res, next) => {
    try {
      // Save the original json method
      const originalJson = res.json;

      // Override the json method
      res.json = async function (data) {
        try {
          // If data is an array, process each item
          if (Array.isArray(data)) {
            const formattedData = await Promise.all(
              data.map((item) => formatWithCreatorUpdater(item, Model))
            );
            console.log("formattedData", formattedData);
            return originalJson.call(this, formattedData);
          }

          // If data is a single object
          if (data && typeof data === "object") {
            const formattedData = await formatWithCreatorUpdater(data, Model);
            console.log("formattedData", formattedData);
            return originalJson.call(this, formattedData);
          }

          // For other types of responses, use the original json method
          return originalJson.call(this, data);
        } catch (error) {
          console.error("Error formatting response:", error);
          return originalJson.call(this, data); // Return original data if formatting fails
        }
      };

      next();
    } catch (error) {
      console.error("Error in response formatter middleware:", error);
      next(error);
    }
  };
};

/**
 * Format a single data object with creator/updater names
 * @param {Object} data - The data object to format
 * @param {Object} Model - Sequelize model to use for fetching user data
 * @returns {Object} Formatted data with creator/updater names
 */
async function formatWithCreatorUpdater(data, Model) {
  if (!data || typeof data !== "object" || data instanceof Error) {
    return data;
  }

  // If data is a Sequelize model instance, convert to plain object
  const plainData = data.get ? data.get({ plain: true }) : { ...data };

  // Only process if the data has createdBy or updatedBy fields
  if ("createdBy" in plainData || "updatedBy" in plainData) {
    try {
      // Get creator and updater user data if they exist
      const [creator, updater] = await Promise.all([
        plainData.createdBy
          ? user.findByPk(plainData.createdBy, {
              attributes: ["firstName", "lastName"],
            })
          : null,
        plainData.updatedBy
          ? user.findByPk(plainData.updatedBy, {
              attributes: ["firstName", "lastName"],
            })
          : null,
      ]);

      // Add creator and updater names
      return {
        ...plainData,
        createdByName: creator
          ? `${creator.firstName} ${creator.lastName}`
          : null,
        updatedByName: updater
          ? `${updater.firstName} ${updater.lastName}`
          : null,
      };
    } catch (error) {
      console.error("Error formatting creator/updater names:", error);
      return plainData; // Return original data if there's an error
    }
  }

  return plainData;
}

module.exports = withCreatorUpdaterNames;
