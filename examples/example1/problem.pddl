(define (problem lost-artifact-problem)
  (:domain lost-artifact)

  (:objects
    arya kharun - character
    oasisvillage caravancamp ruins dunes - location
    mapfragmenta jeweledscarab - item
  )

  (:init
    (at arya oasisvillage)
    (has arya mapfragmenta)
    (map-intact)
    (at kharun caravancamp)
    (rival-unarmed)
    (guardian-dormant)
    (not (sandstorm-active))
    (artifact-location ruins)

    (accessible oasisvillage dunes)
    (accessible dunes oasisvillage)

    (accessible dunes ruins)
    (accessible ruins dunes)

    (accessible dunes caravancamp)
    (accessible caravancamp dunes)
  )

  (:goal (and
    (has arya jeweledscarab)
    (at arya oasisvillage)
  ))
)