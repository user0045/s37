
-- Function to get all content with proper joins
CREATE OR REPLACE FUNCTION get_all_content_with_details()
RETURNS TABLE (
    upload_id UUID,
    title TEXT,
    content_type content_type_enum,
    genre TEXT[],
    content_id UUID,
    upload_created_at TIMESTAMP WITH TIME ZONE,
    upload_updated_at TIMESTAMP WITH TIME ZONE,
    movie_data JSONB,
    show_data JSONB,
    web_series_data JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH content_with_details AS (
        SELECT 
            uc.id as upload_id,
            uc.title,
            uc.content_type,
            uc.genre,
            uc.content_id,
            uc.created_at as upload_created_at,
            uc.updated_at as upload_updated_at,
            CASE 
                WHEN uc.content_type = 'Movie' THEN to_jsonb(m.*)
                ELSE NULL
            END as movie_data,
            CASE 
                WHEN uc.content_type = 'Show' THEN 
                    jsonb_build_object(
                        'id', s.id,
                        'description', s.description,
                        'release_year', s.release_year,
                        'rating_type', s.rating_type,
                        'rating', s.rating,
                        'directors', s.directors,
                        'writers', s.writers,
                        'cast_members', s.cast_members,
                        'thumbnail_url', s.thumbnail_url,
                        'trailer_url', s.trailer_url,
                        'episode_id_list', s.episode_id_list,
                        'feature_in', s.feature_in,
                        'views', s.views,
                        'created_at', s.created_at,
                        'updated_at', s.updated_at
                    )
                ELSE NULL
            END as show_data,
            CASE 
                WHEN uc.content_type = 'Web Series' THEN to_jsonb(ws.*)
                ELSE NULL
            END as web_series_data
        FROM upload_content uc
        LEFT JOIN movie m ON uc.content_id = m.content_id AND uc.content_type = 'Movie'
        LEFT JOIN show s ON uc.content_id = s.id AND uc.content_type = 'Show'
        LEFT JOIN web_series ws ON uc.content_id = ws.content_id AND uc.content_type = 'Web Series'
        ORDER BY uc.updated_at DESC, uc.created_at DESC
    )
    SELECT * FROM content_with_details;
END;
$$;

-- Drop existing function first
DROP FUNCTION IF EXISTS fix_show_content_ids();

-- Function to ensure show content_id consistency
CREATE OR REPLACE FUNCTION fix_show_content_ids()
RETURNS TABLE (
    fixed_count INTEGER,
    total_shows INTEGER,
    orphaned_shows INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    show_count INTEGER;
    orphaned_count INTEGER;
    fixed_count INTEGER := 0;
BEGIN
    -- Count total shows
    SELECT COUNT(*) INTO show_count FROM show;
    
    -- Count orphaned upload_content entries for shows
    SELECT COUNT(*) INTO orphaned_count 
    FROM upload_content uc
    WHERE uc.content_type = 'Show' 
    AND NOT EXISTS (SELECT 1 FROM show s WHERE s.id = uc.content_id);
    
    -- Update any mismatched references if needed
    UPDATE upload_content 
    SET updated_at = now()
    WHERE upload_content.content_type = 'Show' 
    AND EXISTS (SELECT 1 FROM show s WHERE s.id = upload_content.content_id);
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    
    RETURN QUERY SELECT fixed_count, show_count, orphaned_count;
END;
$$;

-- Execute the fix
SELECT fix_show_content_ids();

-- Create index for better performance (remove content_id index for show since it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_upload_content_type_id ON upload_content(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_show_id ON show(id);
CREATE INDEX IF NOT EXISTS idx_movie_content_id ON movie(content_id);
CREATE INDEX IF NOT EXISTS idx_web_series_content_id ON web_series(content_id);
