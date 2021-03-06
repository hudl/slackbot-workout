exports.channelLeaderboard = function(table_name) {
    return `
                select
                    username,
                    sum(case when exercise = 'pushups' and completed_at is not null then reps else 0 end) as pushups,
                    sum(case when exercise = 'planks' and completed_at is not null then reps else 0 end) as planks,
                    sum(case when exercise = 'wall sit' and completed_at is not null then reps else 0 end) as wallsits,
                    sum(case when exercise = 'chair dips' and completed_at is not null then reps else 0 end) as chairdips,
                    sum(case when exercise = 'calf raises' and completed_at is not null then reps else 0 end) as calfraises,
                    sum(case when exercise = 'jumping jacks' and completed_at is not null then reps else 0 end) as jumpingjacks,
                    sum(case when exercise = 'jog in place' and completed_at is not null then reps else 0 end) as joginplace,
                    sum(case when exercise = 'sit ups' and completed_at is not null then reps else 0 end) as situps,
                    sum(case when exercise = 'lunges' and completed_at is not null then reps else 0 end) as lunges,
                    sum(case when exercise = 'burpees' and completed_at is not null then reps else 0 end) as burpees,
                    count(case when completed_at is not null then 1 else null end) * 100 / count(*) as completion_pct
                from ${table_name}
                group by username
                order by completion_pct desc
            `;
}

exports.officeTotal = function(table_name) {
  return `
    select
      '${table_name}' as username,
      pushups, planks, wallsits, chairdips, calfraises, jumpingjacks, joginplace, situps, lunges, burpees, completion_pct, total_assigned
      from (
        select
          sum(case when exercise = 'pushups' and completed_at is not null then reps else 0 end) as pushups,
          sum(case when exercise = 'planks' and completed_at is not null then reps else 0 end) as planks,
          sum(case when exercise = 'wall sit' and completed_at is not null then reps else 0 end) as wallsits,
          sum(case when exercise = 'chair dips' and completed_at is not null then reps else 0 end) as chairdips,
          sum(case when exercise = 'calf raises' and completed_at is not null then reps else 0 end) as calfraises,
          sum(case when exercise = 'jumping jacks' and completed_at is not null then reps else 0 end) as jumpingjacks,
          sum(case when exercise = 'jog in place' and completed_at is not null then reps else 0 end) as joginplace,
          sum(case when exercise = 'sit ups' and completed_at is not null then reps else 0 end) as situps,
          sum(case when exercise = 'lunges' and completed_at is not null then reps else 0 end) as lunges,
          sum(case when exercise = 'burpees' and completed_at is not null then reps else 0 end) as burpees,
          count(case when completed_at is not null then 1 else null end) * 100 / (case when count(*) > 0 then count(*) else 1 end) as completion_pct,
          count(*) total_assigned
        from ${table_name}
    ) x
  `;
}
