export interface AbstractFixture<CreatedData> {
  up(): Promise<CreatedData>;
  down(): Promise<void>;
}
