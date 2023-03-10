// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
const ical = require('node-ical');
var moment = require('moment')
import { Moment } from 'moment'
import path from "path";

interface WasteDate {
    type: string
    date: Moment
    dateSimple: string
    day: string
    color: string
    warning: boolean
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<WasteDate>
) {
    const dates: WasteDate[] = []
    const jsonDirectory = path.join(process.cwd(), 'public');
    const data = await ical.parseFile(jsonDirectory + '/DUS_Abfuhrtermine_Stand_20230109.ICS')
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
                if (type.indexOf('Weihnachtsbaumabfuhr') >= 0) {
                    type = '🎄'
                    color = '#b0591f'
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
                dates.push({
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
    const sortedDates = dates.sort((a: WasteDate ,b:WasteDate) => {
        return a.date.diff(b.date)
    })
    const nextDates = sortedDates.filter((d) => {
        return d.date.isAfter(moment().utc(true))
    })
    res.status(200).json(nextDates[0])
}
