import { FSRS } from "https://cdn.jsdelivr.net/npm/@austinshelby/simple-ts-fsrs@2.0.2/dist/index.js";

export class SRS {
  constructor() {
    this.fsrs = new FSRS();
  }

  assessRecall(rating) {
    // rating 是 "Forgot", "Hard", "Good", "Easy" 四档之一
    return this.fsrs.assessRecall({ rating });
  }
}

// 使用示例
export const srs = new SRS();
