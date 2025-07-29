(define (problem retrieve-crystal-of-light)
  (:domain knights-quest)
  (:objects
    cedric - knight
    whispering_woods_edge - start_location
    whispering_woods - woods_location
    shadowed_keep - keep_location
    eldoria_castle - final_location
  )

  (:init
    (at cedric whispering_woods_edge)
    (has cedric sword)
    (has cedric map)
    (item_at crystal_of_light shadowed_keep)
  )

  (:goal (and
      (at cedric eldoria_castle)
      (has cedric crystal_of_light)
    )
  )
)