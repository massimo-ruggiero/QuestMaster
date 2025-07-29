(define (domain eldergrove-quest)
  (:requirements :strips :typing :negative-preconditions)
  (:types character item location)

  (:constants
    edge_of_eldergrove misty_pathways guardian_lair eldergrove_clearing - location
    magical_compass heart_of_the_forest - item
  )

  (:predicates
    (at ?c - character ?l - location)
    (has ?c - character ?i - item)
    (heart-is-at-lair)
    (pathways-entered)
    (creatures-evaded)
    (guardian-confronted)
    (guardian-appeased)
    (info-gathered)
    (illusions-faced)
    (glade-discovered)
  )

  (:action gather-information
    :parameters (?c - character)
    :precondition (and
      (at ?c edge_of_eldergrove)
      (not (info-gathered))
    )
    :effect (and
      (info-gathered)
    )
  )

  (:action enter-misty-pathways
    :parameters (?c - character)
    :precondition (and
      (at ?c edge_of_eldergrove)
      (has ?c magical_compass)
    )
    :effect (and
      (at ?c misty_pathways)
      (not (at ?c edge_of_eldergrove))
      (pathways-entered)
    )
  )

  (:action face-disorienting-illusions
    :parameters (?c - character)
    :precondition (and
      (at ?c misty_pathways)
      (pathways-entered)
      (not (illusions-faced))
    )
    :effect (and
      (illusions-faced)
    )
  )

  (:action evade-dark-creatures
    :parameters (?c - character)
    :precondition (and
      (at ?c misty_pathways)
      (pathways-entered)
      (not (creatures-evaded))
    )
    :effect (and
      (creatures-evaded)
    )
  )

  (:action discover-hidden-glade
    :parameters (?c - character)
    :precondition (and
      (at ?c misty_pathways)
      (creatures-evaded)
      (not (glade-discovered))
    )
    :effect (and
      (glade-discovered)
    )
  )

  (:action confront-guardian
    :parameters (?c - character)
    :precondition (and
      (at ?c misty_pathways)
      (creatures-evaded)
    )
    :effect (and
      (at ?c guardian_lair)
      (not (at ?c misty_pathways))
      (guardian-confronted)
    )
  )

  (:action go-back-to-pathways
    :parameters (?c - character)
    :precondition (and
      (at ?c guardian_lair)
    )
    :effect (and
      (at ?c misty_pathways)
      (not (at ?c guardian_lair))
    )
  )

  (:action pass-guardian-test-and-retrieve-heart
    :parameters (?c - character)
    :precondition (and
      (at ?c guardian_lair)
      (guardian-confronted)
      (heart-is-at-lair)
    )
    :effect (and
      (guardian-appeased)
      (has ?c heart_of_the_forest)
      (not (heart-is-at-lair))
    )
  )

  (:action return-to-clearing
    :parameters (?c - character)
    :precondition (and
      (at ?c guardian_lair)
      (has ?c heart_of_the_forest)
      (guardian-appeased)
    )
    :effect (and
      (at ?c eldergrove_clearing)
      (not (at ?c guardian_lair))
    )
  )
)