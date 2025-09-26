import { Injectable } from '@nestjs/common';

@Injectable()
export class DocketService {
  calculateDeadlines(priorityDate: Date, matterType: string) {
    const deadlines = [];
    const priority = new Date(priorityDate);

    // 12-month priority deadline
    const priority12m = new Date(priority);
    priority12m.setMonth(priority12m.getMonth() + 12);
    deadlines.push({
      type: 'PRIORITY_12M',
      date: priority12m,
      description: '12-month priority deadline',
    });

    // PCT 30-month deadline
    if (matterType === 'PCT') {
      const pct30m = new Date(priority);
      pct30m.setMonth(pct30m.getMonth() + 30);
      deadlines.push({
        type: 'PCT_30M',
        date: pct30m,
        description: 'PCT 30-month national phase deadline',
      });
    }

    return deadlines;
  }
}