(define (domain lost-artifact)
  (:requirements :strips :typing)
  (:types location item character)

  (:predicates
    (at ?a - character ?l - location)
    (has ?a - character ?i - item)
    (sandstorm-active)
    (guardian-awake)
    (guardian-dormant)
    (rival-armed)
    (rival-unarmed)
    (artifact-retrieved)
    (map-intact)
    (accessible ?from - location ?to - location)
    (artifact-location ?l - location)
  )

  (:action travel
    :parameters (?a - character ?from - location ?to - location)
    :precondition (and 
      (at ?a ?from)
      (accessible ?from ?to)
      (not (sandstorm-active))
    )
    :effect (and
      (not (at ?a ?from))
      (at ?a ?to)
    )
  )

  (:action activate-sandstorm
    :parameters ()
    :precondition ()
    :effect (sandstorm-active)
  )

  (:action retrieve-artifact
    :parameters (?a - character ?i - item ?l - location)
    :precondition (and 
      (at ?a ?l)
      (artifact-location ?l)
      (not (guardian-awake))
    )
    :effect (and
      (has ?a ?i)
      (artifact-retrieved)
    )
  )

  (:action awaken-guardian
    :parameters ()
    :precondition ()
    :effect (and
      (guardian-awake)
      (not (guardian-dormant))
    )
  )

  (:action disarm-rival
    :parameters (?a - character ?r - character ?l - location)
    :precondition (and
      (at ?a ?l)
      (at ?r ?l)
      (rival-armed)
    )
    :effect (and
      (rival-unarmed)
      (not (rival-armed))
    )
  )

  (:action steal-map
    :parameters (?r - character ?a - character ?i - item ?l - location)
    :precondition (and
      (at ?r ?l)
      (at ?a ?l)
      (has ?a ?i)
      (rival-unarmed)
    )
    :effect (and
      (not (has ?a ?i))
      (not (map-intact))
    )
  )

  (:action escape-desert
    :parameters (?a - character ?i - item ?l - location)
    :precondition (and
      (has ?a ?i)
      (at ?a ?l)
    )
    :effect ()
  )
)