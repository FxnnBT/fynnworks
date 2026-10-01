#!/bin/sh
# Meldt nieuwe bezoekers in een Discord-kanaal (visit-notify.service). Losse
# bezoeken bewaart GoatCounter hier niet (privacyverklaring art. 6), dus dit
# vergelijkt elke minuut het totaal per pagina in hit_counts met de vorige
# keer. Bots en je eigen bezoeken zitten daar al niet in. Een fout stopt het
# script; systemd start het een minuut later opnieuw.
set -eu
state=/var/lib/visit-notify/seen.sqlite3

while :; do
  # flags 4 = geen linkvoorbeelden, allowed_mentions leeg = geen @everyone:
  # pad en aantallen komen uit /count, en dat kan iedereen aanroepen.
  msg=$(sqlite3 "$state" <<'SQL'
attach 'file:/var/lib/goatcounter/db.sqlite3?mode=ro' as gc;
create table if not exists seen (path_id integer primary key, total integer not null);
drop table if exists pending;
create table pending as select path_id, sum(total) as total from gc.hit_counts group by path_id;
select json_object(
  'content', substr('Bezoek op fynnworks.nl' || char(10) ||
    group_concat((p.total - coalesce(s.total, 0)) || '× ' || g.path, char(10)), 1, 2000),
  'flags', 4,
  'allowed_mentions', json_object('parse', json_array()))
from pending p join gc.paths g using (path_id) left join seen s using (path_id)
where p.total > coalesce(s.total, 0)
having count(*) > 0;
SQL
)
  if [ -n "$msg" ]; then
    curl -fsS -m 10 -o /dev/null -H 'Content-Type: application/json' -d "$msg" "$DISCORD_WEBHOOK"
  fi
  # Pas na een geslaagde verzending als gezien markeren.
  sqlite3 "$state" 'replace into seen select * from pending'
  sleep 60
done
