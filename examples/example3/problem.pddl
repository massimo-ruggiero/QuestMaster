(define (problem retrieve-crystal)
  (:domain ithar-quest)

  ;; Solo gli oggetti NON già dichiarati come costanti
  (:objects
     elara   - character)

  (:init
     ;; stato iniziale
     (at elara thandor)
     (has elara bow)

     ;; oggetti posizionati nel mondo
     (item-at light_amulet abandoned_temple)
     (item-at crystal_of_ithar malreks_tower)

     ;; rete di percorsi esistenti (ponte ancora crollato)
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
