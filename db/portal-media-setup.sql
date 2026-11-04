-- Luca Films portal: media table + all current site videos/photos.
-- Safe to run more than once: the table is only created if missing, and the
-- seed only runs while the table is empty.

CREATE TABLE IF NOT EXISTS public.media (
  id serial PRIMARY KEY,
  kind text NOT NULL,
  category text NOT NULL,
  title text NOT NULL DEFAULT '',
  src text NOT NULL,
  artist text,
  aspect text NOT NULL DEFAULT '16/9',
  position integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_kind_category_position_idx ON public.media (kind, category, position);

-- Block the public Supabase API (the site connects as postgres, which bypasses RLS)
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

INSERT INTO public.media (kind, category, title, src, artist, aspect, position, featured)
SELECT * FROM (VALUES
  ('video', 'music', 'Two Door Cinema Club', 'https://www.youtube-nocookie.com/embed/omdgY4VaRPE?si=CTGxh2KKS_bEn8uM&controls=0', NULL, '16/9', 0, false),
  ('video', 'music', 'Red Clay Strays', 'https://www.youtube.com/embed/r_59JjsZaz4?controls=0&modestbranding=1&rel=0&playsinline=1', NULL, '9/16', 1, false),
  ('video', 'sports', 'Home of the Titans', 'https://www.youtube-nocookie.com/embed/1WD9J_-PJlQ?si=yD2xY_4aMNWlgbiV&controls=0', NULL, '16/9', 0, false),
  ('video', 'sports', 'Roll South', 'https://www.youtube-nocookie.com/embed/XG2WVE4Y0cg?si=u48GD5YMB6n6GxiH&controls=0', NULL, '16/9', 1, false),
  ('video', 'sports', 'Glenbrook South Football', 'https://www.youtube-nocookie.com/embed/u4KPLhTTo3g?si=V7RTadZUw6uKyaJp&controls=0', NULL, '16/9', 2, false),
  ('video', 'sports', 'Glenbrook South Hockey', 'https://www.youtube-nocookie.com/embed/vSOkSNK1-E4?si=QA3ee9odZ2WRs7Jj&controls=0', NULL, '16/9', 3, false),
  ('video', 'snow', 'Crystal Ridge Park Follow Cam', 'https://www.youtube.com/embed/VwkKoKVDU3g?modestbranding=1&rel=0&playsinline=1&controls=0', NULL, '9/16', 0, false),
  ('video', 'snow', 'Alpine Valley Park Follow Cam #1', 'https://www.youtube.com/embed/o5AmOaYRXjw?modestbranding=1&rel=0&playsinline=1&controls=0', NULL, '9/16', 1, false),
  ('video', 'snow', 'Alpine Valley Park Follow Cam #3', 'https://www.youtube.com/embed/p-lvvaiAmOQ?modestbranding=1&rel=0&playsinline=1&controls=0', NULL, '9/16', 2, false),
  ('video', 'snow', 'Alpine Valley Park Follow Cam #2', 'https://www.youtube.com/embed/_H6hO0xat2s?modestbranding=1&rel=0&playsinline=1&controls=0', NULL, '9/16', 3, false),
  ('video', 'hospitality', 'Ovvio', 'https://www.youtube-nocookie.com/embed/vXhoXWMxVr0?si=hyk8Th8K5eyMKj-_&controls=0', NULL, '16/9', 0, false),
  ('video', 'hospitality', 'Ovvio', 'https://www.youtube-nocookie.com/embed/STKgmNhSFP0?si=CTtxMoX7NUXfw3bd&controls=0', NULL, '16/9', 1, false),
  ('video', 'hospitality', 'Alpine Valley Resorts Wedding', 'https://www.youtube-nocookie.com/embed/ROQukR7EJgA?si=yfDztzVF7diBHTo4&controls=0', NULL, '16/9', 2, false),
  ('video', 'hospitality', 'Lake Forest Chiro', 'https://www.youtube.com/embed/xlhhCYGaEqo?si=3GockmbNT9IHYxb0&controls=0&modestbranding=1&rel=0&playsinline=1', NULL, '9/16', 3, false),
  ('video', 'hospitality', 'Backyard Breaks Interview', 'https://www.youtube.com/embed/J_fgrEz_QOg?modestbranding=1&rel=0&playsinline=1&controls=0', NULL, '9/16', 4, false),
  ('photo', 'music', 'Lord Huron live at Salt Shed', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165049/AnnaMariaIsland-154_orakkw.jpg', 'LORD HURON', '16/9', 0, true),
  ('photo', 'music', 'Lord Huron concert photography', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165048/AnnaMariaIsland-161_ovbkfe.jpg', 'LORD HURON', '16/9', 1, false),
  ('photo', 'music', 'Lord Huron stage performance', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165047/AnnaMariaIsland-165_jfisyj.jpg', 'LORD HURON', '16/9', 2, true),
  ('photo', 'music', 'Lord Huron live music photography', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165047/AnnaMariaIsland-172_dbxs4c.jpg', 'LORD HURON', '16/9', 3, false),
  ('photo', 'music', 'Lord Huron night concert', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165041/AnnaMariaIsland-150_11.15.58_PM_aogf1u.jpg', 'LORD HURON', '16/9', 4, false),
  ('photo', 'music', 'Lord Huron Salt Shed Chicago', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165040/AnnaMariaIsland-149_x04adk.jpg', 'LORD HURON', '16/9', 5, true),
  ('photo', 'music', 'Lord Huron concert crowd', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165040/AnnaMariaIsland-144_inm6bg.jpg', 'LORD HURON', '16/9', 6, false),
  ('photo', 'music', 'Lord Huron stage lights', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165033/AnnaMariaIsland-152_jyt3l4.jpg', 'LORD HURON', '16/9', 7, false),
  ('photo', 'music', 'Red Clay Strays live concert', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164977/Night1RCS-09_wuu7ay.jpg', 'RED CLAY STRAYS', '16/9', 8, true),
  ('photo', 'music', 'Red Clay Strays concert photography', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164975/Night2RCS-59_usmzzf.jpg', 'RED CLAY STRAYS', '16/9', 9, true),
  ('photo', 'music', 'Red Clay Strays stage performance', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164975/Night2RCS-64_bpfi3t.jpg', 'RED CLAY STRAYS', '16/9', 10, false),
  ('photo', 'music', 'Red Clay Strays night two', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164972/Night2RCS-10_hiaddn.jpg', 'RED CLAY STRAYS', '16/9', 11, false),
  ('photo', 'music', 'Red Clay Strays band members', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164971/Night2RCS-07_p3qppu.jpg', 'RED CLAY STRAYS', '16/9', 12, false),
  ('photo', 'music', 'Red Clay Strays live music', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164970/Night2RCS-06_ucgm4p.jpg', 'RED CLAY STRAYS', '16/9', 13, false),
  ('photo', 'music', 'Red Clay Strays night one', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164965/Night1RCS-33_df5kvd.jpg', 'RED CLAY STRAYS', '16/9', 14, true),
  ('photo', 'music', 'Red Clay Strays concert crowd', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164964/Night2RCS-55_ygkrrw.jpg', 'RED CLAY STRAYS', '16/9', 15, false),
  ('photo', 'music', 'Red Clay Strays stage', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164963/Night2RCS-05_d6xzpj.jpg', 'RED CLAY STRAYS', '16/9', 16, false),
  ('photo', 'music', 'Red Clay Strays guitarist', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164961/Night1RCS-10_wya5lw.jpg', 'RED CLAY STRAYS', '16/9', 17, false),
  ('photo', 'music', 'Red Clay Strays vocalist', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164959/Night1RCS-15_ov3rwk.jpg', 'RED CLAY STRAYS', '16/9', 18, false),
  ('photo', 'music', 'Red Clay Strays performance', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164956/Night2RCS-41_v8ds1l.jpg', 'RED CLAY STRAYS', '16/9', 19, false),
  ('photo', 'music', 'Red Clay Strays live show', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164955/Night1RCS-08_hj1ypp.jpg', 'RED CLAY STRAYS', '16/9', 20, false),
  ('photo', 'music', 'Red Clay Strays on stage', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164954/Night1RCS-19_qkusse.jpg', 'RED CLAY STRAYS', '16/9', 21, false),
  ('photo', 'music', 'Red Clay Strays concert detail', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164953/Night1RCS-26_jluiwb.jpg', 'RED CLAY STRAYS', '16/9', 22, false),
  ('photo', 'music', 'Red Clay Strays artist portrait', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164945/Night1RCS-07_aupuor.jpg', 'RED CLAY STRAYS', '16/9', 23, false),
  ('photo', 'music', 'Red Clay Strays night two close-up', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164944/Night2RCS-40_vrfj1x.jpg', 'RED CLAY STRAYS', '16/9', 24, false),
  ('photo', 'music', 'Red Clay Strays stage energy', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164942/Night1RCS-18_tb08k0.jpg', 'RED CLAY STRAYS', '16/9', 25, false),
  ('photo', 'music', 'Red Clay Strays wide shot', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164941/Night2RCS-25_dus8ln.jpg', 'RED CLAY STRAYS', '16/9', 26, false),
  ('photo', 'music', 'Red Clay Strays detail shot', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164940/Night2RCS-12_qyksgh.jpg', 'RED CLAY STRAYS', '16/9', 27, false),
  ('photo', 'music', 'Red Clay Strays live atmosphere', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164937/Night1RCS-16_eddgji.jpg', 'RED CLAY STRAYS', '16/9', 28, false),
  ('photo', 'music', 'Red Clay Strays concert final', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164932/Night2RCS-13_tvecxe.jpg', 'RED CLAY STRAYS', '16/9', 29, false),
  ('photo', 'snow', 'Alpine snow photography', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779239394/Alpine12_19-11_wfa9cx.jpg', NULL, '16/9', 0, false),
  ('photo', 'snow', 'Winter alpine landscape', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779239392/Alpine12_19-08_r9s9hk.jpg', NULL, '16/9', 1, false),
  ('photo', 'snow', 'Snow scene photography', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779239389/Alpine12_19-10_ymeprj.jpg', NULL, '16/9', 2, false),
  ('photo', 'snow', 'Alpine winter photography', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779239388/Alpine12_19-03_xsp8jf.jpg', NULL, '16/9', 3, false),
  ('photo', 'snow', 'Snow landscape', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779239387/Alpine12_19-06_brpy2b.jpg', NULL, '16/9', 4, false),
  ('photo', 'event', 'Event photography Chicago', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165080/DSC00952_nugqp9.jpg', NULL, '16/9', 0, true),
  ('photo', 'event', 'Live event coverage', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165079/DSC01061_irfldl.jpg', NULL, '16/9', 1, true),
  ('photo', 'event', 'Event photography detail', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165079/DSC01052_grjok2.jpg', NULL, '16/9', 2, false),
  ('photo', 'event', 'Event photographer Chicago', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165079/DSC00948_xboict.jpg', NULL, '16/9', 3, false),
  ('photo', 'event', 'Event photography atmosphere', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165078/DSC00909_rldanc.jpg', NULL, '16/9', 4, false),
  ('photo', 'event', 'Event coverage photography', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165075/DSC00959_zkhvwk.jpg', NULL, '16/9', 5, false),
  ('photo', 'event', 'Event photography moments', 'https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165071/DSC00912_igdl4x.jpg', NULL, '16/9', 6, false)
) AS v(kind, category, title, src, artist, aspect, position, featured)
WHERE NOT EXISTS (SELECT 1 FROM public.media);
