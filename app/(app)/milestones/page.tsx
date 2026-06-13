import { MilestoneList } from "@/components/milestones/milestone-list"
import { getMilestones } from "@/lib/milestones/actions"

export default async function MilestonesPage() {
  const milestones = await getMilestones()
  return <MilestoneList milestones={milestones} />
}
