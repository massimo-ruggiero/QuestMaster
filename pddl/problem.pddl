(define (problem recupero-caciocavallo)
  (:domain mucche-intergalattiche)
  (:objects
    cecilia - protagonist
  )
  (:init
    (at cecilia villaggio-bovino)
    (has-mappa cecilia)
  )
  (:goal
    (and
      (at cecilia villaggio-bovino)
      (has-formaggio cecilia)
    )
  )
)