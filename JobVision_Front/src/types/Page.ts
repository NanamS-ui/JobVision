export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // zero-based page index
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
  // Optional Spring metadata we don't use but keep for compatibility
  pageable?: any;
  sort?: any;
}


