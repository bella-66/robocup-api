const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.HOST,
  database: process.env.DATABASE,
  port: process.env.PORTDB,
  user: process.env.USER,
  password: process.env.PASSWORD,
  // host: "localhost",
  // database: "robocup",
  // user: "root",
});

let robocupdb = {};

robocupdb.all = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT timeline.id_timeline, timeline.datum_a_cas, timeline.druh_operacie, sutaz.nazov, (select tim.nazov from tim where timeline.id_tim_1 = tim.id_tim) as tim1, (select tim.nazov from tim where timeline.id_tim_2 = tim.id_tim) as tim2 FROM timeline inner join sutaz on timeline.id_sutaz = sutaz.id_sutaz where timeline.datum_a_cas >= now()-interval 3 month and timeline.datum_a_cas <= now()+INTERVAL 4 month;"
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
      "SELECT timeline.id_timeline,timeline.datum_a_cas,timeline.druh_operacie,timeline.id_tim_2,sutaz.nazov,(select tim.nazov from tim where tim.id_tim=timeline.id_tim_1) as nazov_tim1, (select tim.nazov from tim where tim.id_tim = timeline.id_tim_2) as nazov_tim2 FROM timeline left join sutaz on timeline.id_sutaz=sutaz.id_sutaz where timeline.id_timeline not in (SELECT vysledky.id_timeline from vysledky) AND timeline.druh_operacie!='Results announcement' AND timeline.druh_operacie!='Meeting';"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getTimeline = async (req, res) => {
  try {
    const id_sutaz = req.params.id;
    const [results] = await pool.query(
      `SELECT timeline.*,(select tim.nazov from tim where tim.id_tim=timeline.id_tim_1) as nazov_tim1, (select tim.nazov from tim where tim.id_tim = timeline.id_tim_2) as nazov_tim2 
      FROM timeline left join sutaz on timeline.id_sutaz=sutaz.id_sutaz where (timeline.id_timeline not in (SELECT vysledky.id_timeline from vysledky) 
      AND timeline.druh_operacie!='Results announcement' AND timeline.druh_operacie!='Meeting') AND timeline.id_sutaz='${id_sutaz}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getIdZapisujucaOsoba = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT id_osoba, meno, priezvisko FROM osoba where rola='Referee' or rola='Main Referee';"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.vysledky = async (req, res) => {
  try {
    const id_sutaz = req.params.id;
    const [results] = await pool.query(
      `SELECT (select tim.nazov from tim where timeline.id_tim_1 = tim.id_tim) as tim1, (select tim.nazov from tim where timeline.id_tim_2 = tim.id_tim) as tim2,vysledky.id_zapisujuca_osoba, 
      vysledky.id_timeline,vysledky.datum_zapisu,vysledky.vysledok_1,vysledky.vysledok_2,osoba.meno,osoba.priezvisko,osoba.id_osoba,timeline.datum_a_cas,timeline.druh_operacie, 
      sutaz.nazov FROM vysledky inner join osoba on vysledky.id_zapisujuca_osoba=osoba.id_osoba inner join timeline on vysledky.id_timeline=timeline.id_timeline INNER JOIN 
      sutaz on timeline.id_sutaz=sutaz.id_sutaz where timeline.druh_operacie!='Results announcement' AND sutaz.id_sutaz=${id_sutaz} order by timeline.datum_a_cas desc;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getResultsByComp = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT sutaz.nazov, sutaz.id_sutaz FROM sutaz inner join timeline on sutaz.id_sutaz = timeline.id_sutaz inner join vysledky on timeline.id_timeline = vysledky.id_timeline group by sutaz.id_sutaz ORDER by timeline.datum_a_cas desc;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getUserTeamComps = async (req, res) => {
  try {
    const id_tim = req.params.id;
    const [results] = await pool.query(
      `SELECT sutaz.nazov,sutaz.id_sutaz FROM sutaz inner join timeline on sutaz.id_sutaz=timeline.id_sutaz inner join vysledky on timeline.id_timeline=vysledky.id_timeline
      inner join tim on timeline.id_tim_1=tim.id_tim or timeline.id_tim_2=tim.id_tim where tim.id_tim='${id_tim}' group by sutaz.id_sutaz ORDER by timeline.datum_a_cas desc;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.updateTeamComp = async (req, res) => {
  try {
    const { id_tim, id_sutaz } = req.body;
    const [results] = await pool.query(
      "INSERT INTO tim_sutaz(id_tim,id_sutaz) VALUES (?,?);",
      [id_tim, id_sutaz]
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.deleteTeamComp = async (req, res) => {
  try {
    const { id_tim, id_sutaz } = req.body;
    const [results] = await pool.query(
      `DELETE from tim_sutaz where id_tim='${id_tim}' AND id_sutaz='${id_sutaz}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addTeamComp = async (req, res) => {
  try {
    const { id_tim, sutazValue } = req.body;
    const [results] = await pool.query(
      "INSERT INTO tim_sutaz(id_tim,id_sutaz) VALUES (?,?);",
      [id_tim, sutazValue]
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addCompTeam = async (req, res) => {
  try {
    const { id_sutaz, teamValue } = req.body;
    const [results] = await pool.query(
      "INSERT INTO tim_sutaz(id_tim,id_sutaz) VALUES (?,?);",
      [teamValue, id_sutaz]
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

    if (id_tim_1) {
      await pool
        .query(
          `SELECT * from tim_sutaz where id_tim='${id_tim_1}' AND id_sutaz='${id_sutaz}'`
        )
        .then(async (res) => {
          if (res[0].length === 0) {
            await pool.query(
              "INSERT INTO tim_sutaz(id_tim, id_sutaz) VALUES(?,?);",
              [id_tim_1, id_sutaz]
            );
          }
        });
    }

    if (id_tim_2) {
      await pool
        .query(
          `SELECT * from tim_sutaz where id_tim='${id_tim_2}' AND id_sutaz='${id_sutaz}'`
        )
        .then(async (res) => {
          if (res[0].length === 0) {
            await pool.query(
              "INSERT INTO tim_sutaz(id_tim, id_sutaz) VALUES(?,?);",
              [id_tim_2, id_sutaz]
            );
          }
        });
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

robocupdb.updateEvent = async (req, res, next) => {
  try {
    const {
      nazov,
      datum_od,
      datum_do,
      charakteristika,
      id_realizator,
      id_organizatori,
      id_osoby,
    } = req.body.inputs;
    const { id_event } = req.body;
    await pool.query(
      "UPDATE event SET nazov=?,datum_od=?,datum_do=?,charakteristika=?,id_realizator=? WHERE id_event=?;",
      [nazov, datum_od, datum_do, charakteristika, id_realizator, id_event]
    );
    await pool.query(
      `DELETE from event_organizatori where event_organizatori.id_event='${id_event}';`
    );
    await pool.query(
      `DELETE from event_osoby where event_osoby.id_event='${id_event}';`
    );
    for (let i = 0; i < id_organizatori.length; i++) {
      await pool.query(
        "INSERT INTO event_organizatori (id_event,id_organizacia) VALUES(?,?);",
        [id_event, id_organizatori[i]]
      );
    }
    for (let i = 0; i < id_osoby.length; i++) {
      await pool.query(
        "INSERT INTO event_osoby (id_osoba,id_event) VALUES(?,?);",
        [id_osoby[i], id_event]
      );
    }
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.addEvent = async (req, res, next) => {
  try {
    const {
      nazov,
      datum_od,
      datum_do,
      charakteristika,
      id_realizator,
      id_organizatori,
      id_osoby,
    } = req.body;
    const results = await pool.query(
      "INSERT INTO event (nazov,datum_od,datum_do,charakteristika,id_realizator) VALUES(?,?,?,?,?);",
      [nazov, datum_od, datum_do, charakteristika, id_realizator]
    );
    const id_event = results[0].insertId;

    for (let i = 0; i < id_organizatori.length; i++) {
      await pool.query(
        "INSERT INTO event_organizatori (id_event,id_organizacia) VALUES(?,?);",
        [id_event, id_organizatori[i]]
      );
    }

    for (let i = 0; i < id_osoby.length; i++) {
      await pool.query(
        "INSERT INTO event_osoby (id_osoba,id_event) VALUES(?,?);",
        [id_osoby[i], id_event]
      );
    }

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

robocupdb.getAllResults = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT vysledky.*,osoba.meno,osoba.priezvisko,timeline.druh_operacie,timeline.datum_a_cas,sutaz.nazov,(SELECT tim.nazov from tim where timeline.id_tim_1=tim.id_tim) as tim1, (SELECT tim.nazov from tim where timeline.id_tim_2=tim.id_tim) as tim2 FROM vysledky inner join osoba on vysledky.id_zapisujuca_osoba=osoba.id_osoba inner join timeline on vysledky.id_timeline = timeline.id_timeline inner join sutaz on timeline.id_sutaz=sutaz.id_sutaz;"
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

robocupdb.getTeamToComp = async (req, res) => {
  try {
    const id_tim = req.params.id;
    const [results] = await pool.query(
      `select sutaz.id_sutaz,sutaz.nazov,sutaz.charakteristika from sutaz where id_sutaz NOT IN (SELECT tim_sutaz.id_sutaz from tim_sutaz where tim_sutaz.id_tim='${id_tim}');`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getCompToTeam = async (req, res) => {
  try {
    const id_sutaz = req.params.id;
    const [results] = await pool.query(
      `select tim.*,organizacia.druh,organizacia.nazov as orgNazov from tim inner join organizacia on tim.id_organizacie=organizacia.id_organizacia where tim.id_tim NOT IN (SELECT tim_sutaz.id_tim from tim_sutaz where tim_sutaz.id_sutaz='${id_sutaz}');`
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
      `select event.*, organizacia.nazov as organizaciaNazov, organizacia.druh, organizacia.stat from event inner join organizacia on event.id_realizator = organizacia.id_organizacia where id_event='${id_event}';`
    );
    const [result] = await pool.query(
      `SELECT event_organizatori.id_organizacia,organizacia.druh,organizacia.nazov,organizacia.stat FROM event inner join event_organizatori on event.id_event = event_organizatori.id_event inner join organizacia on event_organizatori.id_organizacia=organizacia.id_organizacia where event_organizatori.id_event='${id_event}';`
    );
    const [resul] = await pool.query(
      `SELECT event_osoby.id_osoba,osoba.meno,osoba.priezvisko,osoba.rola FROM event inner join event_osoby on event.id_event = event_osoby.id_event inner join osoba on event_osoby.id_osoba=osoba.id_osoba where event_osoby.id_event='${id_event}';`
    );

    return res.status(200).json([results, result, resul]);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getAdminTeamById = async (req, res) => {
  try {
    const id_osoba = req.params.id;
    const [results] = await pool.query(
      `select tim.id_tim,tim.nazov from osoba inner join osoba_tim on osoba.id_osoba = osoba_tim.id_osoba inner join tim on osoba_tim.id_tim = tim.id_tim  where osoba.id_osoba = '${id_osoba}';`
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

robocupdb.updateProfile = async (req, res) => {
  try {
    const { email, meno, priezvisko, adresa_domu, telefon } = req.body.inputs;
    const id_osoba = req.body.id_osoba;
    await pool.query(
      `update osoba set meno=?,priezvisko=?,email=?,adresa_domu=?,telefon=? where id_osoba=?;`,
      [meno, priezvisko, email, adresa_domu, telefon, id_osoba]
    );
    const [results] = await pool.query(
      `SELECT * FROM osoba where id_osoba='${id_osoba}';`
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
      `SELECT timeline.id_timeline,timeline.datum_a_cas,timeline.druh_operacie,sutaz.nazov, (select tim.nazov from tim where timeline.id_tim_1=tim.id_tim) as tim1, (select tim.nazov from tim where timeline.id_tim_2=tim.id_tim) as tim2 FROM timeline inner join sutaz on timeline.id_sutaz=sutaz.id_sutaz order by timeline.datum_a_cas;`
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
      `select tim.*,organizacia.druh,organizacia.nazov as org_nazov,organizacia.stat from tim inner join organizacia on organizacia.id_organizacia=tim.id_organizacie WHERE tim.id_tim='${id_tim}';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getTeamCompetitions = async (req, res) => {
  const id_tim = req.params.id;
  try {
    const [results] = await pool.query(
      `select sutaz.id_sutaz,sutaz.nazov as sutazNazov,sutaz.charakteristika from sutaz inner join tim_sutaz on sutaz.id_sutaz=tim_sutaz.id_sutaz inner join tim on tim_sutaz.id_tim=tim.id_tim WHERE tim.id_tim='${id_tim}';`
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
      tim,
    } = req.body[0];
    await pool.query(
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
    await pool.query(
      `DELETE from osoba_tim where osoba_tim.id_osoba='${id_osoba}'`
    );
    for (let i = 0; i < tim.length; i++) {
      await pool.query("INSERT INTO osoba_tim (id_osoba,id_tim) VALUES(?,?);", [
        id_osoba,
        tim[i],
      ]);
    }
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
    const results = await pool.query(
      "UPDATE vysledky SET vysledok_1=?,vysledok_2=? WHERE id_timeline=?;",
      [vysledok_1, vysledok_2, id_timeline]
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
      "SELECT count(id_osoba) as numberOfOsoba from osoba WHERE rola='Competitor';"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getNOComps = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT count(id_sutaz) as numberOfComps from sutaz;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getNOEvents = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT count(id_event) as numberOfEvents from event;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getResultsByTeam = async (req, res) => {
  try {
    const { id_tim, id_sutaz } = req.body;
    const [results] = await pool.query(
      `SELECT (select tim.nazov from tim where timeline.id_tim_1=tim.id_tim) as tim1,(select tim.nazov from tim where timeline.id_tim_2=tim.id_tim) as tim2,vysledky.id_timeline,vysledky.datum_zapisu,
      vysledky.vysledok_1,vysledky.vysledok_2,osoba.meno,osoba.priezvisko,osoba.id_osoba,timeline.datum_a_cas,timeline.druh_operacie,sutaz.nazov FROM vysledky inner join osoba on 
      vysledky.id_zapisujuca_osoba=osoba.id_osoba inner join timeline on vysledky.id_timeline=timeline.id_timeline INNER JOIN sutaz on timeline.id_sutaz=sutaz.id_sutaz 
      where (timeline.id_tim_1='${id_tim}' or timeline.id_tim_2='${id_tim}') AND sutaz.id_sutaz='${id_sutaz}' order by timeline.datum_a_cas desc;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getUpcomingEvents = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT event.*, organizacia.druh, organizacia.nazov as organizaciaNazov, organizacia.stat FROM event inner join organizacia on event.id_realizator = organizacia.id_organizacia where event.datum_od>=CURRENT_DATE() order by event.datum_od DESC LIMIT 12;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getPastEvents = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT event.*, organizacia.druh, organizacia.nazov as organizaciaNazov, organizacia.stat FROM event inner join organizacia on event.id_realizator = organizacia.id_organizacia where event.datum_od<CURRENT_DATE() order by event.datum_od DESC LIMIT 12;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getAllEvents = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT event.*, organizacia.druh, organizacia.nazov as organizaciaNazov, organizacia.stat FROM event inner join organizacia on event.id_realizator = organizacia.id_organizacia;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getRealizator = async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT id_organizacia, nazov, stat, druh FROM organizacia;`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getEventOsoby = async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT meno,priezvisko,id_osoba FROM osoba where rola != 'Competitor' AND rola!='Administrator';`
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

robocupdb.getAddResultComps = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT sutaz.* FROM timeline inner join sutaz on timeline.id_sutaz=sutaz.id_sutaz where (timeline.id_timeline not in (SELECT vysledky.id_timeline from vysledky) AND timeline.druh_operacie!='Results announcement' AND timeline.druh_operacie!='Meeting') group by sutaz.id_sutaz;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = robocupdb;
