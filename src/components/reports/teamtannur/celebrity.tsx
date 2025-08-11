'use client';

import TeamMemberRow, { TeamMember } from '@/components/product/TeamMemberRow';

export default function CelebrityRow({
  member,
  onClick,
  className,
}: {
  member: TeamMember;
  onClick?: (m: TeamMember) => void;
  className?: string;
}) {
  return <TeamMemberRow member={member} onClick={onClick} className={className} />;
}
