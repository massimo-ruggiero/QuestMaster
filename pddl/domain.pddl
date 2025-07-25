(define (domain shattered-kingdom)
  (:requirements :strips :typing :equality)
  (:types
    hero sorcerer - character
    faction
    location
    fragment
  )

  (:predicates
    (at ?h - hero ?l - location)
    (sorcerer-at ?s - sorcerer ?l - location)
    (faction-at ?f - faction ?l - location)
    (has-fragment ?h - hero ?frag - fragment)
    (faction-holds-fragment ?f - faction ?frag - fragment)
    (connected ?from - location ?to - location)
    (path-is-stormy ?from - location ?to - location)
    (path-has-bandits ?from - location ?to - location)
    (faction-is-distrustful ?f - faction)
    (malakar-is-active)
    (malakar-is-defeated)
    (crystal-is-restored)
    (information-is-gathered)
    (allies-are-recruited)
    (scouted-location ?l - location)
    (is-village ?l - location)
  )

  (:action gather-information
    :parameters (?h - hero ?l - location)
    :precondition (and
      (at ?h ?l)
      (is-village ?l)
      (not (information-is-gathered))
    )
    :effect (and
      (information-is-gathered)
    )
  )

  (:action recruit-allies
    :parameters (?h - hero ?l - location)
    :precondition (and
      (at ?h ?l)
      (is-village ?l)
      (not (allies-are-recruited))
    )
    :effect (and
      (allies-are-recruited)
    )
  )

  (:action travel
    :parameters (?h - hero ?from - location ?to - location)
    :precondition (and
      (at ?h ?from)
      (connected ?from ?to)
      (information-is-gathered)
      (not (path-is-stormy ?from ?to))
      (not (path-has-bandits ?from ?to))
    )
    :effect (and
      (not (at ?h ?from))
      (at ?h ?to)
    )
  )

  (:action calm-stormy-path
    :parameters (?h - hero ?from - location ?to - location)
    :precondition (and
      (at ?h ?from)
      (path-is-stormy ?from ?to)
    )
    :effect (and
      (not (path-is-stormy ?from ?to))
    )
  )

  (:action defeat-bandits-on-path
    :parameters (?h - hero ?from - location ?to - location)
    :precondition (and
      (at ?h ?from)
      (path-has-bandits ?from ?to)
    )
    :effect (and
      (not (path-has-bandits ?from ?to))
    )
  )

  (:action complete-faction-trial
    :parameters (?h - hero ?f - faction ?frag - fragment ?l - location)
    :precondition (and
      (at ?h ?l)
      (faction-at ?f ?l)
      (faction-is-distrustful ?f)
      (faction-holds-fragment ?f ?frag)
    )
    :effect (and
      (not (faction-is-distrustful ?f))
      (not (faction-holds-fragment ?f ?frag))
      (has-fragment ?h ?frag)
    )
  )

  (:action scout-for-hidden-paths
    :parameters (?h - hero ?l - location)
    :precondition (and
      (at ?h ?l)
      (not (scouted-location ?l))
    )
    :effect (and
      (scouted-location ?l)
    )
  )

  (:action confront-malakar-and-restore-crystal
    :parameters (?h - hero ?s - sorcerer ?l - location ?f1 - fragment ?f2 - fragment ?f3 - fragment)
    :precondition (and
      (at ?h ?l)
      (sorcerer-at ?s ?l)
      (malakar-is-active)
      (has-fragment ?h ?f1)
      (has-fragment ?h ?f2)
      (has-fragment ?h ?f3)
      (not (= ?f1 ?f2))
      (not (= ?f1 ?f3))
      (not (= ?f2 ?f3))
    )
    :effect (and
      (not (malakar-is-active))
      (malakar-is-defeated)
      (crystal-is-restored)
    )
  )
)