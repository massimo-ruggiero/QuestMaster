(define (domain whispers-of-the-hollow-moon)
  (:requirements :strips :typing)
  (:types
    agent location sigil
  )

  (:constants
    astral-chime somniari-crest mirror-shard noctis-tear - sigil
  )

  (:predicates
    (at ?a - agent ?l - location)
    (path ?from - location ?to - location)
    (has-sigil ?s - sigil)
    (sigil-is-at ?s - sigil ?l - location)
    (can-reclaim ?s - sigil)
    (ritual-site ?l - location)
    (ritual-performed)
    (puzzle-decoded-at ?l - location)
    (mirrorkin-faced-at ?l - location)
    (identity-eroded)
    (identity-secured)
  )

  (:action travel
    :parameters (?a - agent ?from - location ?to - location)
    :precondition (and
      (at ?a ?from)
      (path ?from ?to)
    )
    :effect (and
      (not (at ?a ?from))
      (at ?a ?to)
    )
  )

  (:action decode-memory-puzzle
    :parameters (?a - agent ?l - location)
    :precondition (and
      (at ?a ?l)
      (not (puzzle-decoded-at ?l))
    )
    :effect (and
      (puzzle-decoded-at ?l)
    )
  )

  (:action face-mirrorkin
    :parameters (?a - agent ?l - location)
    :precondition (and
      (at ?a ?l)
      (not (mirrorkin-faced-at ?l))
    )
    :effect (and
      (mirrorkin-faced-at ?l)
    )
  )

  (:action reclaim-sigil
    :parameters (?a - agent ?s - sigil ?l - location)
    :precondition (and
      (at ?a ?l)
      (sigil-is-at ?s ?l)
      (can-reclaim ?s)
      (puzzle-decoded-at ?l)
    )
    :effect (and
      (has-sigil ?s)
      (not (sigil-is-at ?s ?l))
    )
  )

  (:action resist-sleep-decay
    :parameters (?a - agent)
    :precondition (and
      (identity-eroded)
    )
    :effect (and
      (not (identity-eroded))
      (identity-secured)
    )
  )

  (:action perform-lunar-sealing
    :parameters (?a - agent ?l - location)
    :precondition (and
      (at ?a ?l)
      (ritual-site ?l)
      (identity-secured)
      (has-sigil astral-chime)
      (has-sigil somniari-crest)
      (has-sigil mirror-shard)
      (has-sigil noctis-tear)
    )
    :effect (and
      (ritual-performed)
    )
  )
)