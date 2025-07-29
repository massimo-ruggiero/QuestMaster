(define (problem restore-the-enchanted-grove)
  (:domain eldoria-quest)
  (:objects
    elara - character
    nox - spirit
  )

  (:init
    (at elara grove_entrance)
    (has elara healing_herb)
    (has elara map_of_eldoria)
    (grove_is_cursed)
    (plant_is_hostile cursed_plant)

    (connected grove_entrance grove_interior)
    (connected grove_interior grove_entrance)
    (connected grove_entrance village)
    (connected village grove_entrance)
    (connected grove_interior village)
    (connected village grove_interior)
  )

  (:goal (and
    (at elara village)
    (grove_is_restored)
  ))
)