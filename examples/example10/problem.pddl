(define (problem retrieve-heart-of-eldergrove)
  (:domain eldergrove-quest)
  (:objects
    lira - character
  )
  (:init
    (at lira edge_of_eldergrove)
    (has lira magical_compass)
    (heart-is-at-lair)
  )
  (:goal (and
      (has lira heart_of_the_forest)
      (at lira eldergrove_clearing)
    )
  )
)