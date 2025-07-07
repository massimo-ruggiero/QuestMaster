(define (problem retrieve-the-heart)
  (:domain emberfall-conspiracy)
  (:objects
    seeker - character
    elarion fractured-court ashspire-mountains ancient-ruins - location
    heart-of-cinders - item
    fractured-nobles false-prophets - faction
    ashborn-horde - creature
  )

  (:init
    (at seeker elarion)

    ; Path layout
    (path-exists elarion fractured-court)
    (path-exists fractured-court elarion)
    (path-exists fractured-court ashspire-mountains)
    (path-exists ashspire-mountains fractured-court)

    ; Obstacles and their locations
    (faction-is-at fractured-nobles fractured-court)
    (negotiations-possible fractured-nobles)

    (creatures-block-path ashborn-horde ashspire-mountains ancient-ruins)

    (prophets-guard-artifact false-prophets ancient-ruins)

    (artifact-is-at heart-of-cinders ancient-ruins)
  )

  (:goal (and
    (has-item seeker heart-of-cinders)
  ))
)