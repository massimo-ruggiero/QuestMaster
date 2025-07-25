(define (problem spada-di-luce-quest)
  (:domain la-spada-di-luce)
  (:objects
    sir-cedric - character
    lumina foresta-tenebris fortezza-malakar - location
    mappa-regno amuleto-protettivo spada-luce - item
  )

  (:init
    (at sir-cedric lumina)
    (has sir-cedric mappa-regno)
    (has sir-cedric amuleto-protettivo)
    (fog-active)
    (creatures-active)
    (traps-active)
    (malakar-active)
    (sword-is-at-fortress)
  )

  (:goal (and
    (at sir-cedric lumina)
    (has sir-cedric spada-luce)
    (peace-restored)
  ))
)