const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/index");
const apiRouterLogin = require("./routes/login");
const apiRouterVysledky = require("./routes/vysledky");
const apiRouterTimeline = require("./routes/timeline");
const apiRouterCompetition = require("./routes/competition");
const apiRouterTeam = require("./routes/team");
const apiRouterOsoba = require("./routes/osoba");
const apiRouterEvent = require("./routes/event");
const apiRouterOrganization = require("./routes/organization");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", apiRouter);
app.use("/login", apiRouterLogin);
app.use("/vysledky", apiRouterVysledky);
app.use("/timeline", apiRouterTimeline);
app.use("/competition", apiRouterCompetition);
app.use("/team", apiRouterTeam);
app.use("/osoba", apiRouterOsoba);
app.use("/event", apiRouterEvent);
app.use("/organization", apiRouterOrganization);

const PORT = 3000;
app.listen(() => {
  console.log("Server is running");
});
