import {
  AccountDurationTrophy,
  AllSuperRankTrophy,
  AncientAccountTrophy,
  BloggerTrophy,
  MentorTrophy,  
  ArchitectTrophy,
  PolyglotTrophy,
  Joined2020Trophy,
  LongTimeAccountTrophy,
  MultipleLangTrophy,
  MultipleOrganizationsTrophy,
  OGAccountTrophy,
  TotalCommitTrophy,
  TotalFollowerTrophy,
  TotalIssueTrophy,
  TotalPullRequestTrophy,
  TotalRepositoryTrophy,
  TotalReviewsTrophy,
  TotalStarTrophy,
  Trophy,
} from "./trophy.ts";
import { UserInfo } from "./user_info.ts";
import { RANK, RANK_ORDER } from "./utils.ts";

export class TrophyList {
  private trophies = new Array<Trophy>();
  constructor(userInfo: UserInfo) {
    // 🎯 CYNTHIA'S CUSTOM TROPHY SET
    // Core GitHub metrics (no stars - removed TotalStarTrophy)
    this.trophies.push(
      new TotalCommitTrophy(userInfo.totalCommits),
      new TotalFollowerTrophy(userInfo.totalFollowers),
      new TotalIssueTrophy(userInfo.totalIssues),
      new TotalPullRequestTrophy(userInfo.totalPullRequests),
      new TotalRepositoryTrophy(userInfo.totalRepositories),
    );
    
    // 🎨 Custom trophies for specialized achievements
    this.trophies.push(
      new BloggerTrophy(userInfo.devtoArticles || 0), // Will need to add this to UserInfo
      new MentorTrophy(userInfo.totalReviews),
      new ArchitectTrophy(userInfo.totalLinesOfCode || 0), // Will need to add this
      new PolyglotTrophy(userInfo.languageCount),
    );
    
    // 🚫 REMOVED ALL SECRET TROPHIES (not relevant for newer GitHub accounts)
    // - AllSuperRankTrophy, MultipleLangTrophy, LongTimeAccountTrophy  
    // - AncientAccountTrophy, OGAccountTrophy, Joined2020Trophy
    // - MultipleOrganizationsTrophy, AccountDurationTrophy
  }
  get length() {
    return this.trophies.length;
  }
  get getArray() {
    return this.trophies;
  }
  private get isAllSRank() {
    return this.trophies.every((trophy) => trophy.rank.slice(0, 1) == RANK.S)
      ? 1
      : 0;
  }
  filterByHidden() {
    this.trophies = this.trophies.filter((trophy) =>
      !trophy.hidden || trophy.rank !== RANK.UNKNOWN
    );
  }
  filterByTitles(titles: Array<string>) {
    this.trophies = this.trophies.filter((trophy) => {
      return trophy.filterTitles.some((title) => titles.includes(title));
    });
  }
  filterByRanks(ranks: Array<string>) {
    if (ranks.filter((rank) => rank.includes("-")).length !== 0) {
      this.trophies = this.trophies.filter((trophy) =>
        !ranks.map((rank) => rank.substring(1)).includes(trophy.rank)
      );
      return;
    }
    this.trophies = this.trophies.filter((trophy) =>
      ranks.includes(trophy.rank)
    );
  }
  filterByExclusionTitles(titles: Array<string>) {
    const excludeTitles = titles.filter((title) => title.startsWith("-")).map(
      (title) => title.substring(1),
    );
    if (excludeTitles.length > 0) {
      this.trophies = this.trophies.filter((trophy) =>
        !excludeTitles.includes(trophy.title)
      );
    }
  }
  sortByRank() {
    this.trophies = this.trophies.toSorted((a: Trophy, b: Trophy) =>
      RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank)
    );
  }
}
