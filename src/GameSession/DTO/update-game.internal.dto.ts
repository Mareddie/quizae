// This is an internal DTO - we don't need to store validation rules here as it's not in the scope of this aggregate
export class UpdateGameInternalDTO {
  gameId: string;

  currentPlayerId?: string;
  nextPlayerId?: string;
}
