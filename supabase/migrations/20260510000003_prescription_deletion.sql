-- Allow pharmacists and admins to delete prescriptions from the database
CREATE POLICY "Pharmacists can delete prescriptions" ON public.prescriptions
FOR DELETE USING (is_pharmacist());

CREATE POLICY "Admins can delete prescriptions" ON public.prescriptions
FOR DELETE USING (is_admin());

-- Also allow deletion of prescription files from storage
CREATE POLICY "Pharmacists and Admins can delete prescription files."
ON storage.objects FOR DELETE USING (
    bucket_id = 'prescriptions' AND (is_pharmacist() OR is_admin())
);
