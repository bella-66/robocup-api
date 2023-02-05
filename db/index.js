const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "robocup",
  //   port: 3306,
  // host: "sql210.epizy.com",
  // user: "epiz_33525166",
  // password: "FPEErMAcYXJC",
  // database: "epiz_33525166_robocup",
  // port: 3306,
});

let robocupdb = {};

robocupdb.all = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT timeline.id_timeline, timeline.datum_a_cas, timeline.druh_operacie, sutaz.nazov, (select tim.nazov from tim where timeline.id_tim_1 = tim.id_tim) as tim1, (select tim.nazov from tim where timeline.id_tim_2 = tim.id_tim) as tim2 FROM timeline inner join sutaz on timeline.id_sutaz = sutaz.id_sutaz where timeline.datum_a_cas >= CURRENT_DATE() order by timeline.datum_a_cas ASC LIMIT 10;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.profile = async (req, res) => {
  try {
    const { id_osoba } = req.body;
    const [results] = await pool.query(
      `select osoba.meno, tim.nazov, tim.id_tim from osoba inner join osoba_tim on osoba.id_osoba = osoba_tim.id_osoba inner join tim on osoba_tim.id_tim = tim.id_tim  where osoba.id_osoba = '${id_osoba}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getIdTimeline = async (req, res) => {
  try {
    //inner join ked nie je sutaz v timeline
    const [results] = await pool.query(
      "SELECT timeline.id_timeline, timeline.datum_a_cas, timeline.druh_operacie, timeline.id_tim_2, sutaz.nazov, tim.nazov as nazov_tim1 FROM timeline left join sutaz on timeline.id_sutaz = sutaz.id_sutaz inner join tim on timeline.id_tim_1=tim.id_tim where timeline.id_timeline not in (SELECT vysledky.id_timeline from vysledky) AND timeline.druh_operacie != 'Vyhlasenie vysledkov';"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getIdZapisujucaOsoba = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT id_osoba, meno, priezvisko FROM osoba where rola='rozhodca';"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.vysledky = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT vysledky.id_timeline, vysledky.datum_zapisu, vysledky.vysledok_1, vysledky.vysledok_2, osoba.meno,osoba.priezvisko,osoba.id_osoba,timeline.datum_a_cas, timeline.druh_operacie," +
        "sutaz.nazov FROM vysledky inner join osoba on vysledky.id_zapisujuca_osoba = osoba.id_osoba inner join timeline on vysledky.id_timeline = timeline.id_timeline INNER JOIN sutaz on timeline.id_sutaz = sutaz.id_sutaz where timeline.druh_operacie != 'Vyhlasenie vysledkov';"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addResult = async (req, res, next) => {
  try {
    const {
      id_timeline,
      datum_zapisu,
      id_zapisujuca_osoba,
      vysledok_1,
      vysledok_2,
    } = req.body;
    const results = await pool.query(
      "INSERT INTO vysledky (id_timeline,datum_zapisu,id_zapisujuca_osoba,vysledok_1,vysledok_2) VALUES(?,?,?,?,?);",
      [id_timeline, datum_zapisu, id_zapisujuca_osoba, vysledok_1, vysledok_2]
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getIdSutaz = async (req, res) => {
  try {
    const [results] = await pool.query(
      // "SELECT sutaz.id_sutaz, sutaz.nazov, sutaz.charakteristika FROM sutaz left join timeline on timeline.id_sutaz = sutaz.id_sutaz;"
      "SELECT sutaz.id_sutaz, sutaz.nazov, sutaz.charakteristika FROM sutaz;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addTimeline = async (req, res, next) => {
  try {
    const { datum_a_cas, druh_operacie, id_sutaz, id_tim_1, id_tim_2 } =
      req.body;
    const results = await pool.query(
      "INSERT INTO timeline (datum_a_cas,druh_operacie,id_sutaz,id_tim_1,id_tim_2) VALUES(?,?,?,?,?);",
      [datum_a_cas, druh_operacie, id_sutaz, id_tim_1, id_tim_2]
    );
    const result = await pool.query(
      "INSERT INTO tim_sutaz(id_tim, id_sutaz) VALUES(?,?);",
      [id_tim_1, id_sutaz]
    );
    if (id_tim_2) {
      const resul = await pool.query(
        "INSERT INTO tim_sutaz(id_tim, id_sutaz) VALUES(?,?);",
        [id_tim_2, id_sutaz]
      );
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addCompetition = async (req, res, next) => {
  try {
    const { nazov, charakteristika, id_hlavny_rozhodca, postupova_kvota } =
      req.body;
    const results = await pool.query(
      "INSERT INTO sutaz (nazov,charakteristika,id_hlavny_rozhodca,postupova_kvota) VALUES(?,?,?,?);",
      [nazov, charakteristika, id_hlavny_rozhodca, postupova_kvota]
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addOrganization = async (req, res, next) => {
  try {
    const { druh, nazov, ulica, psc, stat } = req.body;
    const results = await pool.query(
      "INSERT INTO organizacia (druh,nazov,ulica,psc,stat) VALUES(?,?,?,?,?);",
      [druh, nazov, ulica, psc, stat]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addEvent = async (req, res, next) => {
  try {
    const { nazov, datum_od, datum_do, charakteristika } = req.body;
    const results = await pool.query(
      "INSERT INTO event (nazov,datum_od,datum_do,charakteristika) VALUES(?,?,?,?);",
      [nazov, datum_od, datum_do, charakteristika]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addTeam = async (req, res, next) => {
  try {
    const { name, organizaciaValue } = req.body;
    const results = await pool.query(
      "INSERT INTO tim (nazov,id_organizacie) VALUES(?,?);",
      [name, organizaciaValue]
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getTimelineById = async (req, res) => {
  try {
    const id_timeline = req.params.id;
    const [results] = await pool.query(
      `SELECT timeline.id_timeline,timeline.datum_a_cas,timeline.druh_operacie,sutaz.charakteristika,sutaz.postupova_kvota,sutaz.nazov,sutaz.id_sutaz,(select tim.nazov from tim where timeline.id_tim_1 = tim.id_tim) as tim1,
      (select tim.id_tim from tim where timeline.id_tim_1 = tim.id_tim) as id_tim_1, (select tim.nazov from tim where timeline.id_tim_2 = tim.id_tim) as tim2, (select tim.id_tim from tim where timeline.id_tim_2 = tim.id_tim) as id_tim_2 
      FROM timeline inner join sutaz on timeline.id_sutaz = sutaz.id_sutaz where timeline.id_timeline = '${id_timeline}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getResultById = async (req, res) => {
  try {
    const id_timeline = req.params.id;
    const [results] = await pool.query(
      `select vysledky.id_timeline, vysledky.datum_zapisu, vysledky.id_zapisujuca_osoba, vysledky.vysledok_1, vysledky.vysledok_2, timeline.datum_a_cas, timeline.druh_operacie, 
      (select tim.nazov from tim where timeline.id_tim_1 = tim.id_tim) as tim1, (select tim.nazov from tim where timeline.id_tim_2 = tim.id_tim) as tim2, timeline.id_sutaz, sutaz.nazov from 
      vysledky inner join timeline on vysledky.id_timeline = timeline.id_timeline inner join sutaz on timeline.id_sutaz = sutaz.id_sutaz where vysledky.id_timeline='${id_timeline}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getUserById = async (req, res) => {
  try {
    const id_osoba = req.params.id;
    const [results] = await pool.query(
      `select osoba.*, organizacia.druh, organizacia.nazov, organizacia.stat from osoba left join organizacia on organizacia.id_organizacia = osoba.id_organizacie where osoba.id_osoba = '${id_osoba}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getOrganizationById = async (req, res) => {
  try {
    const id_organizacia = req.params.id;
    const [results] = await pool.query(
      `select * from organizacia where id_organizacia = '${id_organizacia}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getCompetitionById = async (req, res) => {
  try {
    const id_sutaz = req.params.id;
    const [results] = await pool.query(
      `SELECT sutaz.*, osoba.meno, osoba.priezvisko FROM sutaz inner join osoba on sutaz.id_hlavny_rozhodca = osoba.id_osoba where id_sutaz = '${id_sutaz}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getEventById = async (req, res) => {
  try {
    const id_event = req.params.id;
    const [results] = await pool.query(
      `select * from event where id_event = '${id_event}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getAdminTeamById = async (req, res) => {
  try {
    const id_osoba = req.params.id;
    const [results] = await pool.query(
      `select tim.id_tim from osoba inner join osoba_tim on osoba.id_osoba = osoba_tim.id_osoba inner join tim on osoba_tim.id_tim = tim.id_tim  where osoba.id_osoba = '${id_osoba}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteOsoba = async (req, res) => {
  try {
    const id_osoba = req.params.id;
    const results = await pool.query(
      `DELETE FROM osoba WHERE osoba.id_osoba = '${id_osoba}'`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteTeam = async (req, res) => {
  try {
    const id_tim = req.params.id;
    const results = await pool.query(
      `DELETE FROM tim WHERE tim.id_tim = '${id_tim}'`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteOrganization = async (req, res) => {
  try {
    const id_organizacia = req.params.id;
    const results = await pool.query(
      `DELETE FROM organizacia WHERE id_organizacia = '${id_organizacia}'`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteResult = async (req, res) => {
  try {
    const id_timeline = req.params.id;
    const results = await pool.query(
      `DELETE FROM vysledky WHERE id_timeline = '${id_timeline}'`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteCompetition = async (req, res) => {
  try {
    const id_sutaz = req.params.id;
    const results = await pool.query(
      `DELETE FROM sutaz WHERE id_sutaz = '${id_sutaz}'`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteTimeline = async (req, res) => {
  try {
    const id_timeline = req.params.id;
    const results = await pool.query(
      `DELETE FROM timeline WHERE id_timeline = '${id_timeline}'`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteEvent = async (req, res) => {
  try {
    const id_event = req.params.id;
    const results = await pool.query(
      `DELETE FROM event WHERE id_event = '${id_event}'`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [results] = await pool.query(
      `select * from osoba where email='${email}' and heslo='${password}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.duplicateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const [results] = await pool.query(
      `select * from osoba where email='${email}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.adminOsoba = async (req, res) => {
  try {
    const [results] = await pool.query(
      `select osoba.*, organizacia.druh, organizacia.nazov, organizacia.stat from osoba left join organizacia on organizacia.id_organizacia = osoba.id_organizacie;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.adminTeam = async (req, res) => {
  try {
    const [results] = await pool.query(
      `select tim.id_tim,tim.nazov,tim.id_organizacie, organizacia.druh, organizacia.nazov as org_nazov, organizacia.stat from tim inner join organizacia on organizacia.id_organizacia = tim.id_organizacie;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.adminOrganization = async (req, res) => {
  try {
    const [results] = await pool.query(`SELECT * FROM organizacia;`);
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.adminCompetition = async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT sutaz.*, osoba.meno, osoba.priezvisko FROM sutaz inner join osoba on sutaz.id_hlavny_rozhodca = osoba.id_osoba;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.adminTimeline = async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT timeline.id_timeline, timeline.datum_a_cas, timeline.druh_operacie, sutaz.nazov, (select tim.nazov from tim where timeline.id_tim_1 = tim.id_tim) as tim1, (select tim.nazov from tim where timeline.id_tim_2 = tim.id_tim) as tim2 FROM timeline inner join sutaz on timeline.id_sutaz = sutaz.id_sutaz order by timeline.datum_a_cas;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getTeamById = async (req, res) => {
  const id_tim = req.params.id;
  try {
    const [results] = await pool.query(
      `select tim.*, organizacia.druh, organizacia.nazov as org_nazov, organizacia.stat from tim inner join organizacia on organizacia.id_organizacia = tim.id_organizacie WHERE tim.id_tim='${id_tim}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.timDDP = async (req, res) => {
  try {
    const [results] = await pool.query("select nazov, id_tim from tim;");
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getOrganizacia = async (req, res) => {
  try {
    const [results] = await pool.query(
      "select nazov, druh, stat, id_organizacia from organizacia;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.tim = async (req, res) => {
  try {
    const { id_osoba, id_tim } = req.body;
    const result = await pool.query(
      "INSERT INTO osoba_tim (id_osoba, id_tim) VALUES (?,?);",
      [id_osoba, id_tim]
    );
    return res.status(200);
  } catch (error) {
    return res.status(200).json(error);
  }
};

robocupdb.register = async (req, res, next) => {
  try {
    const {
      meno,
      priezvisko,
      adresa_domu,
      telefon,
      email,
      heslo,
      rola,
      datum_narodenia,
      organizacia,
    } = req.body;
    console.log(datum_narodenia);
    const results = await pool.query(
      "INSERT INTO osoba (meno,priezvisko,adresa_domu,telefon,email,heslo,rola,datum_narodenia,id_organizacie) VALUES (?,?,?,?,?,?,?,?,?);",
      [
        meno,
        priezvisko,
        adresa_domu,
        telefon,
        email,
        heslo,
        rola,
        datum_narodenia,
        organizacia,
      ]
    );
    const id_osoba = results[0].insertId;
    return res.status(200).json({
      meno,
      priezvisko,
      adresa_domu,
      telefon,
      email,
      heslo,
      rola,
      datum_narodenia,
      organizacia,
      id_osoba,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateUser = async (req, res, next) => {
  try {
    const id_osoba = req.body[1];
    const {
      meno,
      priezvisko,
      adresa_domu,
      telefon,
      email,
      rola,
      datum_narodenia,
      organizacia,
    } = req.body[0];
    const results = await pool.query(
      "UPDATE osoba SET meno=?,priezvisko=?,adresa_domu=?,telefon=?,email=?,rola=?,datum_narodenia=?,id_organizacie=? WHERE id_osoba=?;",
      [
        meno,
        priezvisko,
        adresa_domu,
        telefon,
        email,
        rola,
        datum_narodenia,
        organizacia,
        id_osoba,
      ]
    );
    return res.status(200).json({
      id_osoba,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateTeam = async (req, res, next) => {
  try {
    const { name, organizaciaValue, id_tim } = req.body;
    const results = await pool.query(
      "UPDATE tim SET nazov=?,id_organizacie=? WHERE id_tim=?;",
      [name, organizaciaValue, id_tim]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateOrganization = async (req, res, next) => {
  try {
    const { nazov, druh, ulica, psc, stat } = req.body.inputs;
    const { id_organizacia } = req.body;
    const results = await pool.query(
      "UPDATE organizacia SET druh=?,nazov=?,ulica=?,psc=?,stat=? WHERE id_organizacia=?;",
      [druh, nazov, ulica, psc, stat, id_organizacia]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateResult = async (req, res, next) => {
  try {
    const { id_timeline, vysledok_1, vysledok_2 } = req.body.inputs;
    const { id_timeline_old } = req.body;
    const results = await pool.query(
      "UPDATE vysledky SET id_timeline=?,vysledok_1=?,vysledok_2=? WHERE id_timeline=?;",
      [id_timeline, vysledok_1, vysledok_2, id_timeline_old]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateCompetition = async (req, res, next) => {
  try {
    const { nazov, charakteristika, id_hlavny_rozhodca, postupova_kvota } =
      req.body.inputs;
    const { id_sutaz } = req.body;
    const results = await pool.query(
      "UPDATE sutaz SET nazov=?,charakteristika=?,id_hlavny_rozhodca=?,postupova_kvota=? WHERE id_sutaz=?;",
      [nazov, charakteristika, id_hlavny_rozhodca, postupova_kvota, id_sutaz]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateTimeline = async (req, res, next) => {
  try {
    const { datum_a_cas, druh_operacie, id_sutaz, id_tim_1, id_tim_2 } =
      req.body.inputs;
    const { id_timeline } = req.body;
    const results = await pool.query(
      "UPDATE timeline SET datum_a_cas=?,druh_operacie=?,id_sutaz=?,id_tim_1=?,id_tim_2=? WHERE id_timeline=?;",
      [datum_a_cas, druh_operacie, id_sutaz, id_tim_1, id_tim_2, id_timeline]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateEvent = async (req, res, next) => {
  try {
    const { nazov, datum_od, datum_do, charakteristika } = req.body.inputs;
    const { id_event } = req.body;
    const results = await pool.query(
      "UPDATE event SET nazov=?,datum_od=?,datum_do=?,charakteristika=? WHERE id_event=?;",
      [nazov, datum_od, datum_do, charakteristika, id_event]
    );
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getNOTeams = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT count(id_tim) as numberOfTeams from tim;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getNOOsoba = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT count(id_osoba) as numberOfOsoba from osoba WHERE rola='sutaziaci';"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getResultsByTeam = async (req, res) => {
  try {
    const { id_tim } = req.body;
    const [results] = await pool.query(
      // `SELECT vysledky.id_timeline, vysledky.datum_zapisu, vysledky.vysledok_1, vysledky.vysledok_2, timeline.druh_operacie, timeline.datum_a_cas FROM vysledky inner join
      //  timeline on vysledky.id_timeline = timeline.id_timeline inner join tim_sutaz on timeline.id_sutaz = tim_sutaz.id_sutaz where timeline.druh_operacie != 'Vyhlasenie vysledkov' AND tim_sutaz.id_tim = '${id_tim}';`
      `SELECT vysledky.id_timeline, vysledky.datum_zapisu, vysledky.vysledok_1, vysledky.vysledok_2, timeline.druh_operacie, timeline.datum_a_cas, sutaz.nazov FROM vysledky inner join timeline 
      on vysledky.id_timeline = timeline.id_timeline inner join sutaz on timeline.id_sutaz = sutaz.id_sutaz where timeline.druh_operacie != 'Vyhlasenie vysledkov' AND timeline.id_tim_1 = '${id_tim}' or timeline.id_tim_2 = '${id_tim}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getAllEvents = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM event order by datum_od DESC;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = robocupdb;
