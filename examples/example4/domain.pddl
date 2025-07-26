(define (domain emberfall-conspiracy)
  (:requirements :strips :typing :negative-preconditions)
  (:types
    character location item faction creature
  )

  (:predicates
    (at ?c - character ?l - location)
    (has-item ?c - character ?i - item)
    (path-exists ?from - location ?to - location)
    (knows-path-to-ruins)
    (creatures-block-path ?cr - creature ?from - location ?to - location)
    (creatures-defeated ?cr - creature)
    (prophets-guard-artifact ?f - faction ?l - location)
    (prophets-dealt-with ?f - faction)
    (artifact-is-at ?i - item ?l - location)
    (faction-is-at ?f - faction ?l - location)
    (negotiations-possible ?f - faction)
  )

  (:action travel
    :parameters (?c - character ?from - location ?to - location)
    :precondition (and
      (at ?c ?from)
      (path-exists ?from ?to)
    )
    :effect (and
      (not (at ?c ?from))
      (at ?c ?to)
    )
  )

  (:action negotiate-with-court
    :parameters (?c - character ?f - faction ?l - location)
    :precondition (and
      (at ?c ?l)
      (faction-is-at ?f ?l)
      (negotiations-possible ?f)
    )
    :effect (and
      (knows-path-to-ruins)
      (not (negotiations-possible ?f))
    )
  )

  (:action intimidate-court
    :parameters (?c - character ?f - faction ?l - location)
    :precondition (and
      (at ?c ?l)
      (faction-is-at ?f ?l)
      (negotiations-possible ?f)
    )
    :effect (and
      (knows-path-to-ruins)
      (not (negotiations-possible ?f))
    )
  )

  (:action fight-ashborn-creatures
    :parameters (?c - character ?cr - creature ?l - location ?dest - location)
    :precondition (and
      (at ?c ?l)
      (creatures-block-path ?cr ?l ?dest)
    )
    :effect (and
      (creatures-defeated ?cr)
      (not (creatures-block-path ?cr ?l ?dest))
    )
  )

  (:action sneak-past-ashborn-creatures
    :parameters (?c - character ?cr - creature ?l - location ?dest - location)
    :precondition (and
      (at ?c ?l)
      (creatures-block-path ?cr ?l ?dest)
    )
    :effect (and
      (creatures-defeated ?cr)
      (not (creatures-block-path ?cr ?l ?dest))
    )
  )

  (:action discover-path-to-ruins
    :parameters (?from - location ?to - location)
    :precondition (and
      (knows-path-to-ruins)
      (not (path-exists ?from ?to))
    )
    :effect (and
      (path-exists ?from ?to)
      (path-exists ?to ?from)
    )
  )

  (:action confront-false-prophets
    :parameters (?c - character ?f - faction ?l - location)
    :precondition (and
      (at ?c ?l)
      (prophets-guard-artifact ?f ?l)
    )
    :effect (and
      (prophets-dealt-with ?f)
      (not (prophets-guard-artifact ?f ?l))
    )
  )

  (:action persuade-false-prophets
    :parameters (?c - character ?f - faction ?l - location)
    :precondition (and
      (at ?c ?l)
      (prophets-guard-artifact ?f ?l)
    )
    :effect (and
      (prophets-dealt-with ?f)
      (not (prophets-guard-artifact ?f ?l))
    )
  )

  (:action retrieve-heart-of-cinders
    :parameters (?c - character ?i - item ?f - faction ?l - location)
    :precondition (and
      (at ?c ?l)
      (artifact-is-at ?i ?l)
      (prophets-dealt-with ?f)
    )
    :effect (and
      (has-item ?c ?i)
      (not (artifact-is-at ?i ?l))
    )
  )
)