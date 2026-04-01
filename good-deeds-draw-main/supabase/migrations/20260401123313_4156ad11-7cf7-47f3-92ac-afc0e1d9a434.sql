
CREATE TRIGGER trigger_enforce_max_scores
  AFTER INSERT ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_scores();

CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
