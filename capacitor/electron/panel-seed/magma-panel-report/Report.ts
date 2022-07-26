import { app } from 'electron';
import fs from 'fs'

import config from "./config";

const sqlite3 = require('sqlite3').verbose();
const moment = require('moment-timezone');

interface  RECORD {
    frame : string
    dateTime : string
  }
  
  export class Report {

    private reportName = config.panel.name; // Name of the Tracking Report.
    private reportPath = `${app.getPath("desktop")}/${this.reportName}`;
    private databasePath = `${app.getPath("desktop")}/${this.reportName}/database.db`;
    private dataJSONPath = `${app.getPath("desktop")}/${this.reportName}/data.js`;
    private reportTemplate = `${this.reportPath}/${this.reportName}.html`; //Where the report will save

    constructor() {
        this.initialize()
    }

    initialize(){
        if(!fs.existsSync(this.reportPath)){
            fs.mkdir(this.reportPath, () => {
                fs.writeFile(this.databasePath, '', () => {
                    const db = new sqlite3.Database(this.databasePath, sqlite3.OPEN_READWRITE, (err) => {
                        if(err) return console.error(err.message)
                    })
                    db.run(
                        `CREATE TABLE tracking(frame, dateTime)`
                    )
                    db.close((err) => {
                        if(err) return console.error(err.message)
                    })
                    console.log('Report database created!')
                })
                fs.readFile(`${app.getAppPath()}/assets/magma-panel-report/template.html`, 'utf8', async (err, buff) => {
                    if(err){
                      console.error(err);
                      return
                    }
            
                    let html = buff.toString()
                    fs.writeFile(this.reportTemplate, html
                        //.replace("$$PLACEHOLDER_DATA$$", dynamicHTML)
                        .replace(/\$\$BACKGROUND_COLOR\$\$/g, "'" + config.panel.body_background_color + "'")
                        //.replace("$$LABELS$$", currContent["matchs"].map(function(item) {return "'" + item['frame'] + "'" }).join(','))
                        //.replace("$$DATA_COUNT$$", currContent["matchs"].map(function(item) { return item['count'] }))
                        .replace(/\$\$PLACEHOLDER_TITLE\$\$/g, config.panel.name)
                        //.replace("$$CHART_HEIGHT$$", String((currContent["matchs"].length * 25) + 50))
                      , err => {});

                })
            })
        }
    }

    async insertRecord(record : RECORD){
        const db = new sqlite3.Database(this.databasePath, sqlite3.OPEN_READWRITE, (err) => {
            if(err) return console.error(err.message)
        })
        let timezone = moment().tz(config.panel.timezone)
        const today = new Date();
        let dateTime = today.getUTCFullYear() +"/"+ (today.getUTCMonth()+1) +"/"+ today.getUTCDate() + " " + timezone.hours() + ":" + timezone.minutes();

        await db.run(
            `INSERT INTO tracking (frame, dateTime) VALUES (?,?)`, [record.frame, dateTime]
        )
        await db.all(`SELECT * FROM tracking`, async (err, data) => {
            const info = `var data = ${JSON.stringify(data)}`
            var uint8array = new TextEncoder().encode(info);
           fs.writeFile(this.dataJSONPath, uint8array, 'utf8', function (err : any) {
               if (err) {
                   console.warn("data not created");
                   return
               }
           });
        })
        db.close((err) => {
            if(err) return console.error(err.message)
        })
    }
  }