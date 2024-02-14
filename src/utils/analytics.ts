import { redis } from "@/lib/redis";
import { getDate } from "@/utils";
import { parse } from "date-fns";

type AnalyticsArgs = {
  retentions?: number;
};
type TrackOptions = {
  persist?: boolean;
};
export class Analytics {
  async retrieveDays(namespace: string, ndays: number) {
    type AnalyticsPromises = ReturnType<typeof analytics.retrieve>;
    const promises: AnalyticsPromises[] = [];
    for (let index = 0; index < ndays; index++) {
      const formattedDate = getDate(index);
      const promise = analytics.retrieve(namespace, formattedDate);
      promises.push(promise);
    }
    const fetched = await Promise.all(promises);
    const data = fetched.sort((a, b) => {
      if (
        parse(a.date, "dd/MM/yyyy", new Date()) >
        parse(b.date, "dd/MM/yyyy", new Date())
      )
        return 1;
      else return -1;
    });
    return data;
  }
  async retrieve(namespace: string, date: string) {
    const res = await redis.hgetall<Record<string, string>>(
      `analytics::${namespace}::${date}`
    );
    return {
      date,
      events: Object.entries(res ?? []).map(([key, value]) => ({
        [key]: Number(value),
      })),
    };
  }
  private retentions: number = 60 * 60 * 24 * 7;
  constructor(opt?: AnalyticsArgs) {
    if (opt?.retentions) {
      this.retentions = opt.retentions;
    }
  }
  async track(namespace: string, event: object = {}, opts?: TrackOptions) {
    let key = `analytics::${namespace}`;
    if (!opts?.persist) {
      key += `::${getDate()}`;
    }
    //db call to persist the event
    await redis.hincrby(key, JSON.stringify(event), 1);
    if (!opts?.persist) {
      await redis.expire(key, this.retentions);
    }
  }
}
export const analytics = new Analytics();
