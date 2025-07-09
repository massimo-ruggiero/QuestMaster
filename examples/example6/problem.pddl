(define (problem citadel-infiltration-problem)
  (:domain shadows-of-the-iron-citadel)
  (:objects
    hero - character
  )

  (:init
    (at hero outer-bailey)
    (gate-is-sealed)
    (sentinels-are-active)
    (warden-is-active)
    (core-is-unstable)
    (echo-is-in-vault)
  )

  (:goal (and
    (core-is-recalibrated)
    (has hero echo-of-creation)
  ))
)