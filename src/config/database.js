const { DataSource } = require("typeorm");
const University = require("../entities/University");
const Student = require("../entities/Student");

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [University, Student],
});

module.exports = AppDataSource;
