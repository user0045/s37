
-- Function to get properly structured content data for MoreInfo component
CREATE OR REPLACE FUNCTION get_content_with_details(content_uuid UUID)
RETURNS JSON AS $$
DECLARE
    content_row RECORD;
    movie_data RECORD;
    web_series_data RECORD;
    show_data RECORD;
    season_data RECORD;
    result JSON;
BEGIN
    -- Get the main content record
    SELECT * INTO content_row FROM content WHERE id = content_uuid;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Build base result
    result := json_build_object(
        'id', content_row.id,
        'title', content_row.title,
        'content_type', content_row.content_type,
        'genre', content_row.genre,
        'content_id', content_row.content_id,
        'created_at', content_row.created_at,
        'updated_at', content_row.updated_at
    );
    
    -- Add specific data based on content type
    IF content_row.content_type = 'Movie' THEN
        SELECT * INTO movie_data FROM movie WHERE content_id = content_row.content_id;
        IF FOUND THEN
            result := result || json_build_object(
                'movie', row_to_json(movie_data),
                'originalData', json_build_object(
                    'content_type', content_row.content_type,
                    'genre', content_row.genre,
                    'movie', row_to_json(movie_data)
                ),
                -- Add direct access fields for backward compatibility
                'type', 'movie',
                'image', movie_data.thumbnail_url,
                'description', movie_data.description,
                'year', movie_data.release_year,
                'rating', movie_data.rating_type,
                'score', movie_data.rating
            );
        END IF;
        
    ELSIF content_row.content_type = 'Web Series' THEN
        SELECT * INTO web_series_data FROM web_series WHERE content_id = content_row.content_id;
        IF FOUND THEN
            -- Get first season data for web series
            SELECT s.* INTO season_data 
            FROM season s 
            WHERE s.season_id = ANY(web_series_data.season_id_list)
            ORDER BY s.created_at ASC
            LIMIT 1;
            
            result := result || json_build_object(
                'web_series', json_build_object(
                    'content_id', web_series_data.content_id,
                    'season_id_list', web_series_data.season_id_list,
                    'created_at', web_series_data.created_at,
                    'updated_at', web_series_data.updated_at,
                    'seasons', CASE 
                        WHEN season_data IS NOT NULL THEN 
                            json_build_array(row_to_json(season_data))
                        ELSE 
                            '[]'::json
                    END
                ),
                'originalData', json_build_object(
                    'content_type', content_row.content_type,
                    'genre', content_row.genre,
                    'web_series', json_build_object(
                        'content_id', web_series_data.content_id,
                        'season_id_list', web_series_data.season_id_list,
                        'created_at', web_series_data.created_at,
                        'updated_at', web_series_data.updated_at,
                        'seasons', CASE 
                            WHEN season_data IS NOT NULL THEN 
                                json_build_array(row_to_json(season_data))
                            ELSE 
                                '[]'::json
                        END
                    )
                )
            );
        END IF;
        
    ELSIF content_row.content_type = 'Show' THEN
        SELECT * INTO show_data FROM show WHERE id = content_row.content_id;
        IF FOUND THEN
            result := result || json_build_object(
                'show', row_to_json(show_data),
                'originalData', json_build_object(
                    'content_type', content_row.content_type,
                    'genre', content_row.genre,
                    'show', row_to_json(show_data)
                )
            );
        END IF;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get episode count for content
CREATE OR REPLACE FUNCTION get_episode_count(content_uuid UUID, content_type_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    episode_count INTEGER := 0;
    web_series_row RECORD;
    show_row RECORD;
    season_row RECORD;
BEGIN
    IF content_type_param = 'Web Series' THEN
        -- Get web series and count episodes in first season
        SELECT w.*, c.content_id INTO web_series_row 
        FROM web_series w 
        JOIN content c ON c.content_id = w.content_id 
        WHERE c.id = content_uuid;
        
        IF FOUND AND array_length(web_series_row.season_id_list, 1) > 0 THEN
            SELECT * INTO season_row 
            FROM season 
            WHERE season_id = web_series_row.season_id_list[1];
            
            IF FOUND AND season_row.episodes IS NOT NULL THEN
                episode_count := array_length(season_row.episodes, 1);
            END IF;
        END IF;
        
    ELSIF content_type_param = 'Show' THEN
        -- Get show and count episodes
        SELECT s.*, c.content_id INTO show_row 
        FROM show s 
        JOIN content c ON c.content_id = s.id 
        WHERE c.id = content_uuid;
        
        IF FOUND AND show_row.episode_id_list IS NOT NULL THEN
            episode_count := array_length(show_row.episode_id_list, 1);
        END IF;
    END IF;
    
    RETURN episode_count;
END;
$$ LANGUAGE plpgsql;
