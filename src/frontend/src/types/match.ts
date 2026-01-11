export interface MatchDto {
	id: string;
	datePlayed: string;
	scoreHome: number;
	scoreAway: number;
	homeTeamName: string; // O playerHomeName se 1vs1
	awayTeamName: string; // O playerAwayName
	status: number; // 1 = Played
}
