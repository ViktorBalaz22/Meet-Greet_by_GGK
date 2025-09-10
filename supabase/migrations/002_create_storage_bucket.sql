-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false);

-- Create storage policies for photos bucket
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'photos' AND
    auth.uid()::text = (storage.filename(name))
  );

CREATE POLICY "Users can view all photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.filename(name))
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.filename(name))
  );
