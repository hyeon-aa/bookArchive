export interface TagStat {
  name: string;
  count: number;
}

export class MyTagsResponseDto {
  tags: TagStat[];
}
