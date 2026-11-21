import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";

/** Shown for a project id that doesn't exist or isn't yours (the backend can't say which). */
export function ProjectNotFoundState() {
  return (
    <div className="pt-6">
      <EmptyState
        icon="search"
        title="We can’t find that project"
        body="It may have been deleted, or it belongs to an account you’re not a member of. We can’t tell you which."
        action={<ButtonLink href="/projects">Back to projects</ButtonLink>}
      />
    </div>
  );
}
