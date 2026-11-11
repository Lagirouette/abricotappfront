import ErrorState from "@/src/components/ui/ErrorState";

export default function AppNotFound() {
  return (
    <ErrorState
      code="404"
      title="Page introuvable"
      message="Ce projet ou cette page n'existe pas, ou a été supprimé."
      homeHref="/projects"
      homeLabel="Voir mes projets"
    />
  );
}
