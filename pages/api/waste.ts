// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import moment, {Moment} from "moment";
const ical = require('node-ical');
import fs from 'fs';

type WasteType = 'Rest' | 'Gelb' | 'Bio' | 'Papier'

interface WasteDate {
    type: string
    date: Moment
    dateSimple: string
    day: string
    color: string
    warning: boolean
}

class WasteHandler {

    private static dates : WasteDate[] = []

    constructor () {
        // Perform any setup or initialization here
        let data = ical.parseFile('public/DUS_Abfuhrtermine_Stand_20230109.ICS', (err: any, data: any[]) => {
            if (err) console.log(err);
            for (let k in data) {
                if (data.hasOwnProperty(k)) {
                    var ev = data[k];
                    if (data[k].type == 'VEVENT') {
                        let type = ev.summary
                        let color = ''
                        let warning = false
                        if (moment(ev.start).diff(moment(),'days') <= 1) {
                            warning = true
                        }
                        if (type.indexOf('Bio') >= 0) {
                            type = 'Bio'
                            color = '#b0591f'
                        }
                        if (type.indexOf('Leicht') >= 0) {
                            type = 'Gelb'
                            color = '#f7d117'
                        }
                        if (type.indexOf('Rest') >= 0) {
                            type = 'Rest'
                            color = '#9a9a9a'
                        }
                        if (type.indexOf('Altpapier') >= 0) {
                            type = 'Papier'
                            color = '#1f76b0'
                        }
                        WasteHandler.dates.push({
                            warning,
                            type,
                            color,
                            date: moment(ev.start).utc(true),
                            dateSimple: moment(ev.start).utc(true).format('DD.MM'),
                            day: moment(ev.start).locale("de").utc(true).format('dd'),
                        })
                    }
                }
            }
        });
    }

    public handler(req: NextApiRequest, res: NextApiResponse<WasteDate[]>) {
        if (WasteHandler.dates.length === 0) {
            res.status(200).json([])
        }

        const data = WasteHandler.dates.sort((a: WasteDate ,b:WasteDate) => {
            return a.date.diff(b.date)
        })

        const nextWaste = data.filter(waste => {
            return waste.date.isAfter(moment().utc(true))
        })
        res.status(200).json(nextWaste)
    }
}

export default new WasteHandler().handler;


