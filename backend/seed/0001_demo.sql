-- Seed: demo festival to smoke-test the full flow.
BEGIN;
INSERT INTO festivals (id, name, app_name, start_at, end_at, image, twitter_hashtag)
VALUES ('pespor26', 'PESPOR FESTIVAL ''26', 'PESPOR', '2026-07-24T09:00:00+07:00', '2026-07-26T21:00:00+07:00',
        'https://cdn.example.com/pespor26.jpg', '#pespor26')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_layout (festival_id, primary_color, button_color, status_bar_color, logo, title_color)
VALUES ('pespor26', '#e64219', '#e64219', '#1a1a1a', 'https://cdn.example.com/logo.png', '#ffffff')
ON CONFLICT (festival_id) DO NOTHING;

INSERT INTO app_tabs (festival_id, name, screen, ordering) VALUES
 ('pespor26','Home','home',1),
 ('pespor26','TimeTable','timetable',2),
 ('pespor26','Map','map',3),
 ('pespor26','Lineup','lineup',4),
 ('pespor26','Stamp','stamp',5);

INSERT INTO home_buttons (festival_id, name, icon_url, ordering, destination) VALUES
 ('pespor26','Tickets','https://cdn.example.com/ic_ticket.png',1,'https://ticket.pespor.example'),
 ('pespor26','SNS','https://cdn.example.com/ic_sns.png',2,'https://x.com/pespor');

INSERT INTO stages (festival_id, name, color_code, ordering) VALUES
 ('pespor26','Main Stage','#e64219',1),
 ('pespor26','Valley Field','#2196f3',2),
 ('pespor26','Sunset Garden','#ffb300',3);

INSERT INTO artists (festival_id, name, display_name, spotify_id, ordering) VALUES
 ('pespor26','The Sunrise','The Sunrise','spotify_the_sunrise',1),
 ('pespor26','Neon Waves','Neon Waves','spotify_neon_waves',2),
 ('pespor26','Kotak','Kotak','spotify_kotak',3),
 ('pespor26','Efek Rumah Kaca','ERK','spotify_erk',4),
 ('pespor26','Hindia','Hindia','spotify_hindia',5),
 ('pespor26','Padi Reunion','Padi','spotify_padi',6);

INSERT INTO timetable_slots (festival_id, stage_id, performance_date, start_at, end_at, artist_ids, title) VALUES
 ('pespor26',1,'2026-07-24','2026-07-24T18:00:00+07:00','2026-07-24T19:00:00+07:00','{1}','The Sunrise'),
 ('pespor26',1,'2026-07-24','2026-07-24T20:00:00+07:00','2026-07-24T21:30:00+07:00','{6}','Padi Reunion'),
 ('pespor26',2,'2026-07-24','2026-07-24T17:00:00+07:00','2026-07-24T18:00:00+07:00','{3}','Kotak'),
 ('pespor26',2,'2026-07-25','2026-07-25T19:00:00+07:00','2026-07-25T20:00:00+07:00','{4}','Efek Rumah Kaca'),
 ('pespor26',3,'2026-07-25','2026-07-25T16:00:00+07:00','2026-07-25T17:00:00+07:00','{5}','Hindia');

INSERT INTO map_floors (festival_id, name, map_image, image_width, image_height, ordering, is_default) VALUES
 ('pespor26','Main Area','https://cdn.example.com/map_main.png',1200,900,1,TRUE);

INSERT INTO map_points (festival_id, floor_id, point_type, name, location_x, location_y, ordering) VALUES
 ('pespor26',1,'stage','Main Stage',300,200,1),
 ('pespor26',1,'stage','Valley Field',700,300,2),
 ('pespor26',1,'food','Food Court A',500,600,3),
 ('pespor26',1,'first_aid','Medical Tent',200,700,4);

INSERT INTO news (festival_id, kind, title, body_html, publish_at) VALUES
 ('pespor26','news','Ticket sales open','<p>Early bird tickets now available.</p>', '2026-03-01T10:00:00+07:00'),
 ('pespor26','flash_report','Stage 2 delay','<p>Valley Field opens 30 min late on day 1.</p>', '2026-07-24T08:00:00+07:00');

INSERT INTO stamp_rallies (festival_id, name, explanation, complete_message, prize_password, start_at, finish_at)
VALUES ('pespor26','Venue Explorer','Visit all 3 points to complete!','Thanks for exploring!','PESPOR-2026','2026-07-24T09:00:00+07:00','2026-07-26T21:00:00+07:00');

INSERT INTO stamp_points (rally_id, name, qr_token, ordering) VALUES
 (1,'Main Stage Gate','PSPR-STG-001',1),
 (1,'Food Court','PSPR-FOOD-002',2),
 (1,'Info Tent','PSPR-INFO-003',3);

INSERT INTO revisions (festival_id, entity, revision) VALUES
 ('pespor26','app_layout',1),
 ('pespor26','artist',1),
 ('pespor26','stage',1),
 ('pespor26','timetable',1),
 ('pespor26','map',1),
 ('pespor26','news',1),
 ('pespor26','stamp_rally',1)
ON CONFLICT (festival_id, entity) DO NOTHING;
COMMIT;
