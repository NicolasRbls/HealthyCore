const bcrypt = require("bcrypt");
const config = require("../config/config");

/**
 * Hache un mot de passe
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.SALT_ROUNDS);
};

/**
 * Compare un mot de passe en clair avec un mot de passe haché
 * @param {string} password - Mot de passe en clair
 * @param {string} hashedPassword - Mot de passe haché
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
