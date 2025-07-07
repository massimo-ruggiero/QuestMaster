(define (problem retrieve-crystal)
  (:domain ithar-quest)

  (:objects
     elara   - character)

  (:init
     (at elara thandor)
     (has elara bow)

     (item-at light_amulet abandoned_temple)
     (item-at crystal_of_ithar malreks_tower)

     (connected thandor abandoned_temple)
     (connected abandoned_temple thandor)

     (connected thandor dark_forest)
     (connected dark_forest thandor)

     (connected abandoned_temple dark_forest)
     (connected dark_forest abandoned_temple)

     (connected dark_forest collapsed_bridge)
     (connected collapsed_bridge dark_forest)
  )

  (:goal
     (and (at elara thandor)
          (has elara crystal_of_ithar))
  )
)
