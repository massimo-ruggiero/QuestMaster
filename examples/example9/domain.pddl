(define (domain knights-quest)
  (:requirements :strips :typing :negative-preconditions)
  (:types
    knight item location
    start_location woods_location keep_location final_location - location
  )

  (:constants
    sword map crystal_of_light - item)

  (:predicates
    (at ?k - knight ?l - location)
    (has ?k - knight ?i - item)
    (item_at ?i - item ?l - location)
    (wolves_confronted)
    (illusions_navigated)
    (sorceress_faced)
    (info_gathered)
    (spell_used)
    (passage_found)
    (minions_fought)
    (lair_searched)
  )

  (:action gather_info_from_villagers
    :parameters (?k - knight ?l - start_location)
    :precondition (and
      (at ?k ?l)
      (not (info_gathered))
    )
    :effect (and
      (info_gathered)
    )
  )

  (:action enter_woods_and_confront_wolves
    :parameters (?k - knight ?start - start_location ?woods - woods_location)
    :precondition (and
      (at ?k ?start)
      (not (wolves_confronted))
    )
    :effect (and
      (not (at ?k ?start))
      (at ?k ?woods)
      (wolves_confronted)
    )
  )

  (:action navigate_illusions_to_find_path
    :parameters (?k - knight ?l - woods_location)
    :precondition (and
      (at ?k ?l)
      (wolves_confronted)
      (not (illusions_navigated))
      (not (info_gathered))
    )
    :effect (and
      (illusions_navigated)
    )
  )

  (:action use_spell_to_dispel_illusions
    :parameters (?k - knight ?l - woods_location)
    :precondition (and
      (at ?k ?l)
      (wolves_confronted)
      (info_gathered)
      (not (illusions_navigated))
    )
    :effect (and
      (illusions_navigated)
      (spell_used)
    )
  )

  (:action discover_hidden_passage
    :parameters (?k - knight ?l - woods_location)
    :precondition (and
      (at ?k ?l)
      (illusions_navigated)
      (spell_used)
      (not (passage_found))
    )
    :effect (and
      (passage_found)
    )
  )

  (:action retreat_from_woods
    :parameters (?k - knight ?from - woods_location ?to - start_location)
    :precondition (and
      (at ?k ?from)
    )
    :effect (and
      (not (at ?k ?from))
      (at ?k ?to)
      (not (wolves_confronted))
      (not (illusions_navigated))
      (not (spell_used))
      (not (passage_found))
    )
  )

  (:action reach_keep_and_face_sorceress
    :parameters (?k - knight ?from - woods_location ?to - keep_location)
    :precondition (and
      (at ?k ?from)
      (illusions_navigated)
      (not (passage_found))
      (not (sorceress_faced))
    )
    :effect (and
      (not (at ?k ?from))
      (at ?k ?to)
      (sorceress_faced)
    )
  )

  (:action battle_sorceress_and_minions
    :parameters (?k - knight ?from - woods_location ?to - keep_location)
    :precondition (and
      (at ?k ?from)
      (passage_found)
      (not (sorceress_faced))
    )
    :effect (and
      (not (at ?k ?from))
      (at ?k ?to)
      (sorceress_faced)
      (minions_fought)
    )
  )

  (:action retrieve_crystal_and_return
    :parameters (?k - knight ?from - keep_location ?to - final_location ?c - item)
    :precondition (and
      (at ?k ?from)
      (sorceress_faced)
      (item_at ?c ?from)
    )
    :effect (and
      (not (at ?k ?from))
      (at ?k ?to)
      (has ?k ?c)
      (not (item_at ?c ?from))
    )
  )

  (:action search_lair
    :parameters (?k - knight ?l - keep_location)
    :precondition (and
      (at ?k ?l)
      (sorceress_faced)
      (not (lair_searched))
    )
    :effect (and
      (lair_searched)
    )
  )
)