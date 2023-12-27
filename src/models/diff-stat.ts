interface OldDiffStatProps {
  path: string;
  links: {
    self: {
      href: string;
    };
  };
}

interface NewDiffStatProps {
  path: string;
  links: {
    self?: {
      href: string;
    };
  };
}

export interface DiffStat {
  old: OldDiffStatProps | null;
  new: NewDiffStatProps | null;

  status: 'modified';
}
