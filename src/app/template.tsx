import { PageEnter } from "@/components/motion/page-transition";

/**
 * `template.tsx` remounts on every navigation (unlike `layout.tsx`), which
 * is what gives the arriving page a natural mount point for its entrance.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}
