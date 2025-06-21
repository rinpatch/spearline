-- Function: get_story_blindspot(story_id_param BIGINT)
--
-- Calculates the "blindspot" for a given story by identifying which major
-- media ownership groups, present in the sources table, did not cover the story.
--
-- Returns: An array of TEXT containing the names of the non-covering ownership groups.

CREATE OR REPLACE FUNCTION public.get_story_blindspot(story_id_param BIGINT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  all_owners TEXT[];
  covering_owners TEXT[];
  blindspot_owners TEXT[];
BEGIN
  -- 1. Get a distinct list of ALL ownership groups in the system.
  SELECT array_agg(DISTINCT ownership_details)
  INTO all_owners
  FROM sources_msia.sources;

  -- 2. Get a distinct list of ownership groups that DID cover this specific story.
  SELECT array_agg(DISTINCT s.ownership_details)
  INTO covering_owners
  FROM content_msia.articles a
  JOIN sources_msia.sources s ON a.source_id = s.id
  WHERE a.story_id = story_id_param;
  
  -- If no one covered it, return all owners as the blindspot.
  IF covering_owners IS NULL THEN
    RETURN all_owners;
  END IF;

  -- 3. Calculate the difference (set subtraction) to find the blindspot.
  SELECT array_agg(owner)
  INTO blindspot_owners
  FROM unnest(all_owners) AS owner
  WHERE owner NOT IN (SELECT unnest(covering_owners));

  RETURN blindspot_owners;
END;
$$;