export type Festival = {
  id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
};

export type Performance = {
  id: string;
  festival_id: string;
  artist_name: string;
  stage: string | null;
  start_time: string;
  end_time: string | null;
};
