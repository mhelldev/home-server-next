// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {WasteDate, WasteDateEndpoints} from "@/pages/api/WasteDateEndpoints";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<WasteDate>
) {
    const wasteEndpoint = new WasteDateEndpoints()
    await wasteEndpoint.init()
    res.status(200).json(await wasteEndpoint.getNextDateData())
}
